import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@ui/button";
import { Maximize, Minus, X } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";

export function ActionHeaderBar() {
  const isMobile = useMediaQuery("(max-width: 624px)");

  if (!isTauri() || isMobile) return null;

  const currentWindow = getCurrentWindow();

  return (
    <div className="ml-1 flex items-center border-l border-border/60 pl-1 dark:border-white/10">
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Minimize window"
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void currentWindow.minimize()}
      >
        <Minus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Maximize window"
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-foreground/6 hover:text-foreground dark:hover:bg-white/6"
        onClick={() => void currentWindow.toggleMaximize()}
      >
        <Maximize className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Close window"
        data-tauri-no-drag-region="true"
        className="size-7 rounded-md text-muted-foreground hover:bg-destructive/12 hover:text-destructive"
        onClick={() => void currentWindow.close()}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
