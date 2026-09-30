"use client";

import type { DocumentBlockType } from "@yaad/core/types/document";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@ui/dropdown-menu";
import { Repeat } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TURN_INTO_OPTIONS } from "./menu-constant";

interface BlockTurnIntoSubmenuProps {
  onChangeType: (type: DocumentBlockType) => void;
}

export function BlockTurnIntoSubmenu({
  onChangeType,
}: BlockTurnIntoSubmenuProps) {
  const { t } = useTranslation("editor");
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Repeat className="size-3.5 text-muted-foreground" />
        <span>{t("turnInto")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-64 w-48 overflow-y-auto">
        {TURN_INTO_OPTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.type}
              onClick={() => onChangeType(item.type)}
            >
              <Icon className="size-3.5 text-muted-foreground" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
