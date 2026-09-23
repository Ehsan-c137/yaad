"use client";

import { TooltipProvider } from "@ui/tooltip";
import { WINDOW_HEADER_HEIGHT } from "@yaad/core/constants/sizes";

import { useMediaQuery } from "@/hooks/use-media-query";

import { SidebarToggleButton } from "../breadcrumb/sidebar-button";
import { TabList } from "./tab-list/tab-list";
import { WindowHeaderActions } from "./window-header-actions";

export function WindowHeader() {
  const isMobile = useMediaQuery("(max-width: 624px)");

  if (isMobile) {
    return (
      <header
        className="relative z-20 flex h-10 w-full shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-2 dark:border-white/5 dark:bg-background/60 [app-region:drag]"
        data-tauri-drag-region
      >
        <SidebarToggleButton />
      </header>
    );
  }

  return (
    <TooltipProvider delay={400}>
      <header
        style={{
          height: `${WINDOW_HEADER_HEIGHT}px`,
        }}
        className="relative z-20 flex h-10 w-full shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-2 dark:border-white/5 dark:bg-background/60 [app-region:drag]"
        data-tauri-drag-region
      >
        <div
          className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden pr-2 [app-region:drag]"
          data-tauri-drag-region
        >
          <SidebarToggleButton />

          <TabList />
        </div>

        <WindowHeaderActions />
      </header>
    </TooltipProvider>
  );
}
