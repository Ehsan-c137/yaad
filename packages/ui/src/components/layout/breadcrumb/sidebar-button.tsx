"use client";

import { Button } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSidebarToggle } from "@/hooks/sidebar/use-sidebar-toggle";

export function SidebarToggleButton() {
  const { t } = useTranslation("sidebar");
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);
  const toggleSidebar = useSidebarToggle();

  return (
    <div
      aria-hidden={isSidebarOpen}
      className={
        isSidebarOpen
          ? "pointer-events-none flex max-w-0 shrink-0 scale-95 items-center overflow-hidden opacity-0 transition-[max-width,opacity,transform] duration-200 ease-(--spring)"
          : "max-md:flex md:hidden max-w-9 shrink-0 scale-100 items-center overflow-hidden opacity-100 transition-[max-width,opacity,transform] duration-200 ease-(--spring)"
      }
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggleSidebar}
        disabled={isSidebarOpen}
        aria-label={t("openSidebar")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-lg text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6 [app-region:no-drag]"
      >
        <PanelLeftOpen strokeWidth={1.75} className="size-4 rtl:scale-x-[-1]" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-border/60 dark:bg-white/10" />
    </div>
  );
}
