"use client";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@ui/dropdown-menu";
import { Repeat } from "lucide-react";

import type { DocumentBlockType } from "@/types/document";

import { TURN_INTO_OPTIONS } from "./menu-constant";

interface BlockTurnIntoSubmenuProps {
  onChangeType: (type: DocumentBlockType) => void;
}

export function BlockTurnIntoSubmenu({
  onChangeType,
}: BlockTurnIntoSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Repeat className="size-3.5 text-muted-foreground" />
        <span>Turn into</span>
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
