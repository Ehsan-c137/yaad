"use client";

import { WINDOW_HEADER_HEIGHT } from "@yaad/core/constants/sizes";
import { styles } from "@yaad/core/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { Profile } from "./profile/profile";
import { SidebarTabs } from "./sidebar-tabs";
import { SidebarToggleButton } from "./sidebar-toggle-button";
import { WorkspaceSwitcher } from "./workspace/workspace-switch";

export function Sidebar() {
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);

  const sidebarRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    const handleTouchOutside = (event: TouchEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggleSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("touchstart", handleTouchOutside);

      return () => {
        document.removeEventListener("touchstart", handleTouchOutside);
      };
    }
  }, [isSidebarOpen, toggleSidebar]);

  useLayoutEffect(() => {
    if (isMobile && isSidebarOpen) {
      toggleSidebar();
    }
  }, []); // eslint-disable-line

  return (
    <aside
      ref={sidebarRef}
      aria-label="Sidebar"
      data-state={isSidebarOpen ? "open" : "closed"}
      style={
        {
          "--window-header-height": `${WINDOW_HEADER_HEIGHT}px`,
        } as CSSProperties
      }
      className={cn(
        styles.sidebar,
        "fixed top-0 left-0 z-50 flex h-screen flex-col overflow-x-hidden bg-background p-2 md:sticky",
        "md:h-[calc(100vh-var(--window-header-height))]",
        styles.spring,
        "transition-[width,transform,opacity,padding,scale,visibility] will-change-transform",
        isSidebarOpen
          ? "visible w-70 translate-x-0 scale-100 opacity-100"
          : "pointer-events-none invisible w-0 -translate-x-full scale-95 p-0 opacity-0 md:w-0",
      )}
    >
      <div className="flex items-center justify-between">
        <WorkspaceSwitcher />
        <SidebarToggleButton />
      </div>

      <SidebarTabs />

      <div>
        <Profile />
      </div>
    </aside>
  );
}
