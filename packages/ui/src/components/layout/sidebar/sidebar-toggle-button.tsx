"use client";

import { Button } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSidebarToggle } from "@/hooks/sidebar/use-sidebar-toggle";

export function SidebarToggleButton() {
  const { t } = useTranslation("sidebar");
  const toggleSidebar = useSidebarToggle();
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  const label = isSidebarOpen ? t("closeSidebar") : t("openSidebar");

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      aria-label={label}
      title={label}
      className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
    >
      {isSidebarOpen ? (
        <PanelLeftClose className="size-4 rtl:scale-x-[-1]" strokeWidth={1.5} />
      ) : (
        <PanelLeftOpen className="size-4 rtl:scale-x-[-1]" strokeWidth={1.5} />
      )}
    </Button>
  );
}
