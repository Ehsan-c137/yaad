import { NextResponse } from "next/server";

/** Success payload contract consumed by `LinkPreviewBlock`. */
interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string;
  domain: string;
}

const FETCH_TIMEOUT_MS = 5_000;
const CACHE_REVALIDATE_SECONDS = 3_600;
const MAX_URL_LENGTH = 2_048;

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; NotionCloneBot/1.0)",
  Accept: "text/html,application/xhtml+xml",
};

/** Hostname suffixes that can only refer to the local machine or network. */
const INTERNAL_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".arpa",
];

/**
 * Inclusive IPv4 ranges that must never be fetched, stored as 32-bit
 * integers: loopback, private, link-local (incl. cloud metadata endpoints),
 * CGNAT, documentation and other reserved space.
 */
const BLOCKED_IPV4_RANGES: readonly [number, number][] = [
  [0x00000000, 0x00ffffff], // 0.0.0.0/8       "This network"
  [0x0a000000, 0x0affffff], // 10.0.0.0/8      Private
  [0x64400000, 0x647fffff], // 100.64.0.0/10   CGNAT
  [0x7f000000, 0x7fffffff], // 127.0.0.0/8     Loopback
  [0xa9fe0000, 0xa9feffff], // 169.254.0.0/16  Link-local / cloud metadata
  [0xac100000, 0xac1fffff], // 172.16.0.0/12   Private
  [0xc0000000, 0xc00000ff], // 192.0.0.0/24    IETF protocol assignments
  [0xc0000200, 0xc00002ff], // 192.0.2.0/24    TEST-NET-1
  [0xc0586300, 0xc05863ff], // 192.88.99.0/24  6to4 relay (deprecated)
  [0xc0a80000, 0xc0a8ffff], // 192.168.0.0/16  Private
  [0xc6120000, 0xc613ffff], // 198.18.0.0/15   Benchmarking
  [0xc6336400, 0xc63364ff], // 198.51.100.0/24 TEST-NET-2
  [0xcb007100, 0xcb0071ff], // 203.0.113.0/24  TEST-NET-3
  [0xe0000000, 0xffffffff], // 224.0.0.0/3     Multicast / reserved
];

// ---------------------------------------------------------------------------
// SSRF protection
// ---------------------------------------------------------------------------

function isBlockedIpv4(address: number): boolean {
  return BLOCKED_IPV4_RANGES.some(
    ([low, high]) => address >= low && address <= high,
  );
}

/** Parses a single IPv4 label per the URL spec (decimal, hex or octal). */
function parseIpv4Number(label: string): number | null {
  if (/^0x[0-9a-f]+$/i.test(label)) return Number.parseInt(label.slice(2), 16);
  if (/^0[0-7]+$/.test(label)) return Number.parseInt(label.slice(1), 8);
  // Leading zeros are only valid as octal per the URL spec.
  if (/^0\d+$/.test(label)) return null;
  if (/^\d+$/.test(label)) return Number(label);
  return null;
}

/**
 * Parses an IPv4 host following the URL spec ("ends in a number" rule): the
 * last label may span several octets, while all preceding labels are single
 * octets. Returns the address as a 32-bit integer, or null when malformed.
 */
function parseIpv4HostToAddress(host: string): number | null {
  const labels = host.split(".");
  if (labels.length > 4) return null;

  let address = 0;

  for (let index = 0; index < labels.length - 1; index++) {
    const value = parseIpv4Number(labels[index]);
    if (value === null || value > 255) return null;
    address += value * 256 ** (labels.length - 1 - index);
  }

  const lastValue = parseIpv4Number(labels[labels.length - 1]);
  // The last label covers the remaining octets of the address.

  if (lastValue === null || lastValue >= 256 ** (5 - labels.length)) {
    return null;
  }

  return address + lastValue;
}

/** Whether the URL spec would interpret the host as an IPv4 address. */
function hostEndsInNumber(host: string): boolean {
  const lastLabel = host.split(".").pop() ?? "";
  return /^(?:0x[0-9a-f]+|\d+)$/i.test(lastLabel);
}

/**
 * Expands an IPv6 address into its eight 16-bit groups. Supports "::"
 * compression and a trailing embedded IPv4 segment ("::ffff:127.0.0.1").
 * Returns null when the address is malformed.
 */
function parseIpv6ToGroups(address: string): number[] | null {
  let rest = address;
  let ipv4Tail: number[] | null = null;

  // Peel off a trailing IPv4 segment.
  const ipv4Match = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(address);

  if (ipv4Match) {
    const octets = ipv4Match[1].split(".").map(Number);
    if (octets.some((octet) => octet > 255)) return null;
    ipv4Tail = [octets[0] * 256 + octets[1], octets[2] * 256 + octets[3]];
    rest = address.slice(0, ipv4Match.index);
    if (rest.endsWith(":")) rest = rest.slice(0, -1);
  }

  const halves = rest.split("::");
  if (halves.length > 2) return null;

  const groupPattern = /^[0-9a-f]{1,4}$/i;
  const head = halves[0] === "" ? [] : halves[0].split(":");
  const tail = halves[1] ? halves[1].split(":") : [];
  const headGroups = head.map((group) =>
    groupPattern.test(group) ? Number.parseInt(group, 16) : -1,
  );
  const tailGroups = tail.map((group) =>
    groupPattern.test(group) ? Number.parseInt(group, 16) : -1,
  );
  if (headGroups.includes(-1) || tailGroups.includes(-1)) return null;

  const explicitGroups =
    headGroups.length + tailGroups.length + (ipv4Tail ? 2 : 0);
  if (explicitGroups > 8) return null;
  // Without "::" compression all eight groups must be present.
  if (halves.length === 1 && explicitGroups !== 8) return null;

  const fill = new Array<number>(8 - explicitGroups).fill(0);
  return [...headGroups, ...fill, ...tailGroups, ...(ipv4Tail ?? [])];
}

/** Whether an expanded IPv6 address falls in private or reserved space. */
function isBlockedIpv6(groups: number[]): boolean {
  const isZero = (group: number) => group === 0;

  // :: (unspecified) and ::1 (loopback)
  if (groups.every(isZero)) return true;
  if (groups.slice(0, 7).every(isZero) && groups[7] === 1) return true;

  return embedsBlockedIpv4(groups) || hasReservedIpv6Prefix(groups);
}

/** Whether the address embeds a blocked IPv4 address (mapped/NAT64/6to4). */
function embedsBlockedIpv4(groups: number[]): boolean {
  const [g0, g1, g2, g3, g4, g5, g6, g7] = groups;
  const low32 = g6 * 0x10000 + g7;

  // ::/96 (IPv4-compatible) and ::ffff:0:0/96 (IPv4-mapped) plus
  // 64:ff9b::/96 (NAT64) carry an IPv4 address in the low 32 bits.
  const isLow32Embedded =
    (g0 === 0 &&
      g1 === 0 &&
      g2 === 0 &&
      g3 === 0 &&
      g4 === 0 &&
      (g5 === 0 || g5 === 0xffff)) ||
    (g0 === 0x64 &&
      g1 === 0xff9b &&
      g2 === 0 &&
      g3 === 0 &&
      g4 === 0 &&
      g5 === 0);
  if (isLow32Embedded && isBlockedIpv4(low32)) return true;

  // 2002::/16 (6to4) embeds an IPv4 address in groups 1-2.
  return g0 === 0x2002 && isBlockedIpv4(g1 * 0x10000 + g2);
}

/** Whether the leading bits fall in scoped / reserved IPv6 space. */
function hasReservedIpv6Prefix(groups: number[]): boolean {
  const [g0, g1] = groups;

  if (g0 >= 0xff00) return true; // ff00::/8   multicast
  if (g0 >= 0xfc00 && g0 <= 0xfdff) return true; // fc00::/7  unique local
  if (g0 >= 0xfe80 && g0 <= 0xfebf) return true; // fe80::/10 link-local
  if (g0 >= 0xfec0 && g0 <= 0xfeff) return true; // fec0::/10 site-local (deprecated)
  return g0 === 0x2001 && g1 === 0x0db8; // 2001:db8::/32 documentation
}

/**
 * Rejects hostnames that would make the server request its own network:
 * localhost variants, IPv4/IPv6 literals in private or reserved space, and
 * non-canonical numeric IPv4 spellings as a safety net for runtimes whose
 * URL parser does not canonicalise them.
 */
function isPrivateOrReservedHost(hostname: string): boolean {
  // Lowercase and drop a single trailing DNS root dot ("localhost.").
  const host = hostname.toLowerCase().trim().replace(/\.$/, "");
  const bareHost =
    host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;

  if (bareHost === "localhost") return true;
  if (INTERNAL_HOST_SUFFIXES.some((suffix) => bareHost.endsWith(suffix))) {
    return true;
  }

  // IPv6 literals keep their brackets in URL hostnames; a colon in a bare
  // host can therefore only mean IPv6.
  if (bareHost.includes(":")) {
    const groups = parseIpv6ToGroups(bareHost);
    return groups === null || isBlockedIpv6(groups);
  }

  if (hostEndsInNumber(bareHost)) {
    const address = parseIpv4HostToAddress(bareHost);
    return address === null || isBlockedIpv4(address);
  }

  return false;
}

// ---------------------------------------------------------------------------
// HTML metadata extraction
// ---------------------------------------------------------------------------

const META_TAG_PATTERN = /<meta\b[^>]*>/gi;
const META_ATTRIBUTE_PATTERN = /\b([a-z-]+)\s*=\s*("[^"]*"|'[^']*')/gi;
const TITLE_PATTERN = /<title[^>]*>([^<]+)<\/title>/i;

/** Collects `property`/`name` → `content` pairs from all <meta> tags. */
function collectMetaContent(html: string): Map<string, string> {
  const meta = new Map<string, string>();

  for (const tag of html.matchAll(META_TAG_PATTERN)) {
    const attributes = new Map<string, string>();

    for (const attribute of tag[0].matchAll(META_ATTRIBUTE_PATTERN)) {
      const name = attribute[1].toLowerCase();
      const value = attribute[2].slice(1, -1);

      if (!attributes.has(name)) {
        attributes.set(name, value);
      }
    }

    const key = attributes.get("property") ?? attributes.get("name");
    const content = attributes.get("content");

    if (key && content !== undefined && !meta.has(key.toLowerCase())) {
      meta.set(key.toLowerCase(), content);
    }
  }

  return meta;
}

function extractTitle(html: string): string | null {
  return TITLE_PATTERN.exec(html)?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Preview assembly
// ---------------------------------------------------------------------------

function buildFaviconUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`;
}

/** Strips a leading "www." for display. */
function toDisplayDomain(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/** Makes relative image URLs absolute so the client can render them. */
function resolvePreviewImage(
  image: string | null,
  baseUrl: URL,
): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image;

  try {
    return new URL(image, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractLinkPreview(html: string, url: URL): LinkPreview {
  const meta = collectMetaContent(html);
  const metaContent = (key: string) => meta.get(key) || null;

  const title =
    metaContent("og:title") ||
    metaContent("twitter:title") ||
    extractTitle(html) ||
    url.hostname;
  const description =
    metaContent("og:description") ||
    metaContent("description") ||
    metaContent("twitter:description") ||
    "";

  return {
    title: title.trim(),
    description: description.trim(),
    image: resolvePreviewImage(
      metaContent("og:image") || metaContent("twitter:image"),
      url,
    ),
    favicon: buildFaviconUrl(url.hostname),
    url: url.toString(),
    domain: toDisplayDomain(url.hostname),
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return jsonError("Invalid request body", 400);
    }

    const url =
      typeof requestBody === "object" && requestBody !== null
        ? (requestBody as { url?: unknown }).url
        : undefined;

    if (
      typeof url !== "string" ||
      url.trim() === "" ||
      url.length > MAX_URL_LENGTH
    ) {
      return jsonError("Invalid URL", 400);
    }

    // Ensure the URL has a protocol before parsing.
    const targetUrlString = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrlString);
    } catch {
      return jsonError("Invalid URL format", 400);
    }

    // Restrict protocol to HTTP / HTTPS.
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return jsonError("Forbidden URL protocol", 400);
    }

    // Block local/private IP addresses (SSRF protection).
    if (isPrivateOrReservedHost(parsedUrl.hostname)) {
      return jsonError(
        "Access to private or internal network addresses is forbidden",
        403,
      );
    }

    // Fetch webpage HTML with a 5-second timeout safeguard.
    let html: string;

    try {
      const response = await fetch(parsedUrl, {
        headers: REQUEST_HEADERS,
        next: { revalidate: CACHE_REVALIDATE_SECONDS }, // Cache preview for 1 hour
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        return jsonError("Failed to fetch webpage", 502);
      }

      html = await response.text();
    } catch {
      // Network failure, DNS error or timeout.
      return jsonError("Failed to fetch webpage", 502);
    }

    return NextResponse.json(extractLinkPreview(html, parsedUrl));
  } catch {
    return jsonError("Internal error processing link preview", 500);
  }
}
