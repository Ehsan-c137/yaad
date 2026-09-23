export interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string;
  domain: string;
}

function buildFaviconUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`;
}

function toDisplayDomain(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

export async function fetchLinkPreview(
  rawUrl: string,
): Promise<LinkPreviewData> {
  const targetUrlString = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`;
  const parsedUrl = new URL(targetUrlString);
  const domain = toDisplayDomain(parsedUrl.hostname);
  const favicon = buildFaviconUrl(parsedUrl.hostname);

  try {
    const response = await fetch(targetUrlString, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch page");
    }

    const html = await response.text();
    const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
    const title = titleMatch ? titleMatch[1].trim() : domain;

    const ogDescMatch =
      /<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(
        html,
      ) ||
      /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i.exec(
        html,
      );
    const description = ogDescMatch ? ogDescMatch[1].trim() : "";

    const ogImgMatch =
      /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(
        html,
      );
    let image: string | null = ogImgMatch ? ogImgMatch[1].trim() : null;

    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, parsedUrl).toString();
      } catch {
        image = null;
      }
    }

    return {
      url: targetUrlString,
      title,
      description,
      image,
      favicon,
      domain,
    };
  } catch {
    // Graceful fallback when CORS or network prevents direct HTML fetching
    return {
      url: targetUrlString,
      title: domain,
      description: targetUrlString,
      image: null,
      favicon,
      domain,
    };
  }
}
