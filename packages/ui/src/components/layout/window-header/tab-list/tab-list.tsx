"use client";

import { Button } from "@ui/button";
import { Plus } from "lucide-react";

import { TabItem } from "../tab-item";
import { useTabSync } from "../use-tab-sync";
import { useTabScroll } from "./use-tab-scroll";

export function TabList() {
  const {
    activeDocId,
    activeTabId,
    handleCreateNewTab,
    workspaceTabs: tabs,
  } = useTabSync();

  const { containerRef, handleWheel } = useTabScroll(activeTabId);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      role="tablist"
      aria-label="Open document tabs"
      data-tauri-drag-region
      className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden scroll-smooth py-1 [app-region:drag]"
    >
      {tabs.map((tab) => {
        const isTabActive =
          tab.id === activeTabId || tab.pageId === activeDocId;
        return <TabItem key={tab.id} tab={tab} isActive={isTabActive} />;
      })}

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCreateNewTab}
        aria-label="New tab"
        title="New document tab"
        tooltipSide="bottom"
        data-tauri-no-drag-region="true"
        className="size-7 shrink-0 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6 [app-region:no-drag]"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
