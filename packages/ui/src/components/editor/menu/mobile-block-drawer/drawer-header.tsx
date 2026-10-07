import type { LucideIcon } from "lucide-react";

import { Button } from "@ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface MobileBlockDrawerHeaderProps {
  typeName: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}

export function MobileBlockDrawerHeader({
  typeName,
  icon: Icon,
}: MobileBlockDrawerHeaderProps) {
  const { t } = useTranslation("editor");

  return (
    <DrawerHeader>
      <div className="flex items-center justify-between border-b border-border/40 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4" />
          </div>
          <div>
            <DrawerTitle className="text-sm font-semibold">
              {typeName}
            </DrawerTitle>
            <p className="text-[11px] text-muted-foreground">
              {t("blockActions")}
            </p>
          </div>
        </div>

        <DrawerClose
          render={
            <Button variant="ghost" size="icon-xs" className="rounded-full">
              <X className="size-3.5" />
            </Button>
          }
        />
      </div>
    </DrawerHeader>
  );
}
