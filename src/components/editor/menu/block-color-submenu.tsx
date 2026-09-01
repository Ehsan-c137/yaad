"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@ui/dropdown-menu";
import { Paintbrush } from "lucide-react";

import type { BlockColorUpdate } from "@/types/actions/block-actions";

import { cn } from "@/lib/utils";

import { BlockMenuLabel } from "./block-menu-label";
import { COLOR_OPTIONS } from "./menu-constant";

interface BlockColorSubmenuProps {
  onApplyColor: (color: BlockColorUpdate) => void;
}

export function BlockColorSubmenu({ onApplyColor }: BlockColorSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Paintbrush className="size-3.5 text-muted-foreground" />
        <span>Color</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-64 w-48 overflow-y-auto">
        <DropdownMenuGroup>
          <BlockMenuLabel>Background Color</BlockMenuLabel>
          <div className="flex flex-col gap-1">
            {COLOR_OPTIONS.map((color) => (
              <DropdownMenuItem
                key={color.name}
                className={color.bgClass}
                onClick={() =>
                  onApplyColor({ bgColor: color.name.toLowerCase() })
                }
              >
                <span
                  className={cn(
                    "size-3.5 shrink-0 rounded-sm border border-border",
                    color.bgClass,
                  )}
                />
                <span className={color.textClass}>{color.name}</span>
              </DropdownMenuItem>
            ))}
          </div>
          <BlockMenuLabel>Text Color</BlockMenuLabel>
          {COLOR_OPTIONS.map((color) => (
            <DropdownMenuItem
              key={color.name}
              onClick={() =>
                onApplyColor({ textColor: color.name.toLowerCase() })
              }
            >
              <span className="size-3.5 shrink-0 rounded-sm border border-border" />
              <span className={color.textClass}>{color.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
