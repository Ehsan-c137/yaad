"use client";

import { Network } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { SidebarTabs } from "./sidebar-tabs";
import { SidebarToggleButton } from "./sidebar-toggle-button";
import { WorkspaceSwitcher } from "./workspace/workspace-switch";

const SettingsModal = dynamic(() =>
  import("./setting/settings-modal").then((mod) => mod.SettingsModal),
);

export function Sidebar() {
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
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
      className={cn(
        styles.sidebar,
        "fixed top-0 left-0 z-50 flex h-screen flex-col overflow-x-hidden bg-background p-2 md:sticky",
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
      <div className="flex items-center justify-between pt-1">
        {/* Graph View button */}
        {activeWorkspaceId && (
          <Link
            href={`/workspace/${activeWorkspaceId}/graph`}
            title="Graph View"
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
          >
            <Network className="size-4" strokeWidth={1.5} />
          </Link>
        )}
        <SettingsModal />
      </div>
    </aside>
  );
}
