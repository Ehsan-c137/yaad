import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/landing";
}

export function PwaManager() {
  const location = useLocation();
  const isRegisteredRef = useRef(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Prevent service worker from interfering with local development
    if (import.meta.env.DEV) {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(
              registrations.map((registration) => registration.unregister()),
            ),
          )
          .catch((e) => {
            console.error(e);
          });
      }

      return;
    }

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
    if (
      !isRegisteredRef.current &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      isRegisteredRef.current = true;

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          registrationRef.current = registration;
          console.info(
            "[PWA] Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }
  }, [location.pathname]);

  // Automatically reload when a new service worker takes control
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      import.meta.env.DEV
    ) {
      return;
    }

    let refreshing = false;

    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  // Check for service worker updates on route changes
  useEffect(() => {
    if (registrationRef.current) {
      registrationRef.current.update().catch((e) => {
        console.error(e);
      });
    }
  }, [location.pathname]);

  // Check for updates when the tab/app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && registrationRef.current) {
        registrationRef.current.update().catch((e) => {
          console.error(e);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
