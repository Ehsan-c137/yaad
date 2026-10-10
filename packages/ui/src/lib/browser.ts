/**
 * Helper to detect whether the user is on Firefox (Gecko engine).
 */
export function isFirefox(): boolean {
  if (typeof navigator === "undefined") return false;
  return /firefox|fxios/i.test(navigator.userAgent);
}
