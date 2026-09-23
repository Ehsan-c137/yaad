"use client";

import { Button } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function SidebarToggleButton() {
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={toggleSidebar}
      aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      className="shrink-0 text-muted-foreground hover:text-foreground"
    >
      {isSidebarOpen ? (
        <PanelLeftClose className="size-[18px]" strokeWidth={1.5} />
      ) : (
        <PanelLeftOpen className="size-[18px]" strokeWidth={1.5} />
      )}
    </Button>
  );
}
