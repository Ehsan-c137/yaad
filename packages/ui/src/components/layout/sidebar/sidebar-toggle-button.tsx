"use client";

import { Button } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SidebarToggleButton() {
  const { t } = useTranslation("sidebar");
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  const label = isSidebarOpen ? t("closeSidebar") : t("openSidebar");

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={toggleSidebar}
      aria-label={label}
      title={label}
      className="shrink-0 text-muted-foreground hover:text-foreground"
    >
      {isSidebarOpen ? (
        <PanelLeftClose
          className="size-[18px] rtl:scale-x-[-1]"
          strokeWidth={1.5}
        />
      ) : (
        <PanelLeftOpen
          className="size-[18px] rtl:scale-x-[-1]"
          strokeWidth={1.5}
        />
      )}
    </Button>
  );
}
