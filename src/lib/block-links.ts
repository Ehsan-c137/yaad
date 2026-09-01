/**
 * Builds a URL that deep-links to a block via its hash anchor.
 *
 * @param blockId  Id of the block to link to.
 * @param baseHref Base URL to anchor on; defaults to the current location.
 */
export function buildBlockAnchorUrl(
  blockId: string,
  baseHref: string = window.location.href,
): string {
  const url = new URL(baseHref);
  url.hash = blockId;
  return url.toString();
}
