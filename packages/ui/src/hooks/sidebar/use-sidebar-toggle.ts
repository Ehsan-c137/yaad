import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useCallback } from "react";
import { flushSync } from "react-dom";

import { usePageTransitionPreference } from "@/hooks/use-page-transition-preference";

export function useSidebarToggle() {
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);
  const { transitionsEnabled } = usePageTransitionPreference();

  const handleToggle = useCallback(() => {
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      transitionsEnabled
    ) {
      try {
        document.startViewTransition(() => {
          flushSync(() => {
            toggleSidebar();
          });
        });
      } catch {
        toggleSidebar();
      }
    } else {
      toggleSidebar();
    }
  }, [toggleSidebar, transitionsEnabled]);

  return handleToggle;
}
