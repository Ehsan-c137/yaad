/**
 * Dynamic resolution of API and WebSocket URLs based on runtime environment:
 * 1. Explicit environment variables (VITE_API_URL / VITE_WS_URL)
 * 2. Browser / Web: Same-origin (proxied via Nginx or reverse proxy)
 * 3. Tauri Desktop / Node: Localhost fallback
 */

function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "__TAURI_INTERNALS__" in window ||
    window.location.protocol === "tauri:" ||
    window.location.hostname === "tauri.localhost"
  );
}

export function getDefaultApiBaseUrl(): string {
  // 1. Explicit Vite env
  // @ts-ignore
  if (import.meta?.env?.VITE_API_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_URL;
  }

  // 2. Explicit Node env
  if (typeof process !== "undefined" && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  // 3. Web browser environment (unless running inside Tauri desktop)
  if (
    typeof window !== "undefined" &&
    window.location?.origin &&
    !isTauriEnvironment()
  ) {
    return window.location.origin;
  }

  // 4. Default fallback for local dev / desktop
  return "http://localhost:3000";
}

export function getDefaultWsUrl(): string {
  // 1. Explicit Vite env
  // @ts-ignore
  if (import.meta?.env?.VITE_WS_URL) {
    // @ts-ignore
    return import.meta.env.VITE_WS_URL;
  }

  // 2. Web browser environment (unless running inside Tauri desktop)
  if (
    typeof window !== "undefined" &&
    window.location?.host &&
    !isTauriEnvironment()
  ) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/collab`;
  }

  // 3. Default fallback for local dev / desktop
  return "ws://localhost:3000/collab";
}
