"use client";

import type { CSSProperties } from "react";

import { WINDOW_HEADER_HEIGHT } from "@yaad/core/constants/sizes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "@/hooks/use-media-query";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { Profile } from "./profile/profile";
import { SidebarTabs } from "./sidebar-tabs";
import { SidebarToggleButton } from "./sidebar-toggle-button";
import { WorkspaceSwitcher } from "./workspace/workspace-switch";

export function Sidebar() {
  const { t } = useTranslation("sidebar");
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
    <>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        aria-label={t("openSidebar")}
        data-state={isSidebarOpen ? "open" : "closed"}
        style={
          {
            "--window-header-height": `${WINDOW_HEADER_HEIGHT}px`,
          } as CSSProperties
        }
        className={cn(
          styles.sidebar,
          "fixed top-2 start-2 z-50 flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-72 flex-col overflow-x-hidden rounded-2xl border border-border/80 bg-background/95 p-2.5 shadow-2xl backdrop-blur-xl",
          "md:static md:top-auto md:start-auto md:h-full md:border-border/70 dark:md:border-white/[0.08] md:bg-card/75 dark:md:bg-sidebar/80 md:shadow-xs",
          styles.spring,
          "transition-[width,margin,transform,opacity,padding,scale,visibility] will-change-transform",
          isSidebarOpen
            ? "visible w-70 translate-x-0 scale-100 opacity-100 md:me-2"
            : "pointer-events-none invisible w-0 -translate-x-full rtl:translate-x-full scale-95 p-0 opacity-0 md:me-0 md:w-0 md:border-0",
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
    </>
  );
}
