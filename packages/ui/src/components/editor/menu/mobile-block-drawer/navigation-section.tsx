"use client";

import { Button } from "@ui/button";
import { Copy, ExternalLink, Sidebar as SidePeek } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileNavigationSectionProps {
  onCopyLink: () => void;
  onOpenInNewTab: () => void;
  onOpenInSidePeek: () => void;
}

export function MobileNavigationSection({
  onCopyLink,
  onOpenInNewTab,
  onOpenInSidePeek,
}: MobileNavigationSectionProps) {
  const { t } = useTranslation("editor");

  return (
    <div className="flex flex-col gap-1 border-t border-border/40 pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopyLink}
        className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
      >
        <Copy className="size-3.5" />
        <span>{t("copyLinkToBlock")}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenInNewTab}
        className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="size-3.5" />
        <span>{t("openInNewTab")}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenInSidePeek}
        className="justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
      >
        <SidePeek className="size-3.5" />
        <span>{t("openInSidePeek")}</span>
      </Button>
    </div>
  );
}
