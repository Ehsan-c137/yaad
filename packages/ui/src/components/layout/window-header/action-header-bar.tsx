import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@ui/button";
import { Maximize, Minus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "@/hooks/use-media-query";

export function ActionHeaderBar() {
  const { t } = useTranslation("sidebar");
  const isMobile = useMediaQuery("(max-width: 624px)");

  if (!isTauri() || isMobile) return null;

  const currentWindow = getCurrentWindow();

  return (
    <div className="ms-1 flex items-center border-s border-border/60 ps-1 dark:border-white/10">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("minimizeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void currentWindow.minimize()}
      >
        <Minus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("maximizeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void currentWindow.toggleMaximize()}
      >
        <Maximize className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("closeWindow")}
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-destructive/12 hover:text-destructive"
        onClick={() => void currentWindow.close()}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
