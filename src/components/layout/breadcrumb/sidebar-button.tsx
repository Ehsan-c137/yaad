"use client";

import { Button } from "@ui/button";
import { PanelLeftOpen } from "lucide-react";

import { useSidebarStore } from "@/store/use-sidebar-store";

export function SidebarToggleButton() {
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);

  if (isSidebarOpen) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      aria-label="Open sidebar"
    >
      <PanelLeftOpen strokeWidth={1.75} className="size-4" />
    </Button>
  );
}
