"use client";

import { Button } from "@ui/button";
import { GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DrawerTrigger } from "@/components/ui/drawer";

interface MobileBlockDrawerTriggerProps {
  trigger?: React.ReactElement;
  typeName: string;
}

export function MobileBlockDrawerTrigger({
  trigger,
  typeName,
}: MobileBlockDrawerTriggerProps) {
  const { t } = useTranslation("editor");

  if (trigger) {
    return <DrawerTrigger render={trigger} />;
  }

  return (
    <DrawerTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95"
          title={t("blockOptions")}
        >
          <GripVertical className="size-3.5" />
          <span>{typeName}</span>
        </Button>
      }
    />
  );
}
