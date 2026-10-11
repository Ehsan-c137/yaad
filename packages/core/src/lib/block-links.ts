/**
 * Builds a URL that deep-links to a block via its hash anchor.
 *
 * @param blockId  Id of the block to link to.
 * @param baseHref Base URL to anchor on; defaults to the current location.
 */
export function buildBlockAnchorUrl(
  blockId: string,
  baseHref: string = typeof window !== "undefined"
    ? window.location.href
    : "http://localhost/",
): string {
  const fallback =
    typeof window !== "undefined" ? window.location.href : "http://localhost/";
  const url = new URL(baseHref, fallback);
  url.hash = blockId;
  return url.toString();
}
