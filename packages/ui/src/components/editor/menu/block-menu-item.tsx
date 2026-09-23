"use client";

import type { LucideIcon } from "lucide-react";

import { DropdownMenuItem, DropdownMenuShortcut } from "@ui/dropdown-menu";

import { cn } from "@/lib/utils";

export interface BlockMenuAction {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  variant?: "default" | "destructive";
  onSelect?: () => void;
}

interface BlockMenuItemProps {
  action: BlockMenuAction;
}

export function BlockMenuItem({ action }: BlockMenuItemProps) {
  const { icon: Icon, label, shortcut, variant = "default", onSelect } = action;

  return (
    <DropdownMenuItem variant={variant} onClick={onSelect}>
      <Icon
        className={cn(
          "size-3.5",
          variant !== "destructive" && "text-muted-foreground",
        )}
      />
      <span>{label}</span>
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  );
}
