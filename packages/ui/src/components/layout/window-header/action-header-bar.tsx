import { Button } from "@ui/button";
import { Maximize, Minus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { usePlatform, type WindowControls } from "@/context/platform-context";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface ActionHeaderBarProps {
  windowControls?: WindowControls;
}

export function ActionHeaderBar({
  windowControls: propControls,
}: ActionHeaderBarProps = {}) {
  const { t } = useTranslation("sidebar");
  const isMobile = useMediaQuery("(max-width: 624px)");
  const platform = usePlatform();
  const controls = propControls ?? platform.windowControls;

  if (!controls || isMobile) return null;

  return (
    <div className="ms-1 flex items-center border-s border-border/60 ps-1 dark:border-white/10">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("minimizeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void controls.minimize()}
      >
        <Minus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("maximizeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void controls.toggleMaximize()}
      >
        <Maximize className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("closeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-destructive/12 hover:text-destructive"
        onClick={() => void controls.close()}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
