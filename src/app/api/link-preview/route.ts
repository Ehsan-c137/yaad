import { NextResponse } from "next/server";

function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Block localhost and internal domain suffixes
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan") ||
    host.endsWith(".home") ||
    host.endsWith(".arpa")
  ) {
    return true;
  }

  // Check IPv4 representations
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ipv4Regex.exec(host);

  if (match) {
    const [, a, b, c, d] = match.map(Number);
    if (a > 255 || b > 255 || c > 255 || d > 255) return true;

    if (
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8 (Private)
      a === 127 || // 127.0.0.0/8 (Loopback)
      (a === 169 && b === 254) || // 169.254.0.0/16 (Link-local / AWS Metadata)
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 (Private)
      (a === 192 && b === 168) || // 192.168.0.0/16 (Private)
      (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 (CGNAT)
      (a === 192 && b === 0 && c === 2) || // TEST-NET-1
      (a === 198 && b === 51 && c === 100) || // TEST-NET-2
      (a === 203 && b === 0 && c === 113) || // TEST-NET-3
      a >= 224 // Multicast / Reserved
    ) {
      return true;
    }
  }

  // Check IPv6 representations
  const cleanHost =
    host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;

  if (
    cleanHost === "::1" ||
    cleanHost === "::" ||
    cleanHost.startsWith("fe80:") ||
    cleanHost.startsWith("fc") ||
    cleanHost.startsWith("fd") ||
    cleanHost.startsWith("::ffff:")
  ) {
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Ensure URL has a valid protocol
    const targetUrlString =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrlString);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Restrict protocol to HTTP / HTTPS
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Forbidden URL protocol" },
        { status: 400 },
      );
    }

    // Block local/private IP addresses (SSRF protection)
    if (isPrivateOrReservedHost(parsedUrl.hostname)) {
      return NextResponse.json(
        {
          error: "Access to private or internal network addresses is forbidden",
        },
        { status: 403 },
      );
    }

    // Fetch webpage HTML with a 5-second timeout safeguard
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NotionCloneBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 }, // Cache preview for 1 hour
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch webpage" },
        { status: 502 },
      );
    }

    const html = await res.text();

    const getMetaTag = (prop: string) => {
      const match =
        new RegExp(
          `<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']*)["']`,
          "i",
        ).exec(html) ||
        new RegExp(
          `<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']*)["']`,
          "i",
        ).exec(html) ||
        new RegExp(
          `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${prop}["']`,
          "i",
        ).exec(html);
      return match ? match[1] : null;
    };

    const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
    const title =
      getMetaTag("og:title") ||
      getMetaTag("twitter:title") ||
      (titleMatch ? titleMatch[1] : parsedUrl.hostname);
    const description =
      getMetaTag("og:description") ||
      getMetaTag("description") ||
      getMetaTag("twitter:description") ||
      "";
    let image = getMetaTag("og:image") || getMetaTag("twitter:image") || null;

    // Resolve relative image URLs to absolute
    if (image && !image.startsWith("http")) {
      image = new URL(image, parsedUrl.toString()).toString();
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      favicon,
      url: parsedUrl.toString(),
      domain: parsedUrl.hostname.replace(/^www\./, ""),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error processing link preview" },
      { status: 500 },
    );
  }
}
