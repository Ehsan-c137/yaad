import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/landing";
}

function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.info(
          "[PWA] Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  }
}

export function PwaManager() {
  const location = useLocation();
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    const isLanding = isLandingPath(location.pathname);

    if (isLanding) {
      // Exclude landing page from PWA: remove manifest link so browsers
      // don't treat '/' as an installable PWA page.
      const manifestLink = document.querySelector('link[rel="manifest"]');

      if (manifestLink) {
        manifestLink.remove();
      }

      return;
    }

    // For all app routes: ensure the manifest link is present in head
    let manifestLink = document.querySelector('link[rel="manifest"]');

    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.setAttribute("rel", "manifest");
      manifestLink.setAttribute("href", "/manifest.webmanifest");
      document.head.appendChild(manifestLink);
    }

    // Register service worker on first visit to any app route
    if (!isRegisteredRef.current) {
      isRegisteredRef.current = true;
      registerServiceWorker();
    }
  }, [location.pathname]);

  return null;
}
