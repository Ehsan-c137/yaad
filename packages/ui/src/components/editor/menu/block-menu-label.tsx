"use client";

import type { ReactNode } from "react";

import { DropdownMenuLabel } from "@ui/dropdown-menu";

interface BlockMenuLabelProps {
  children: ReactNode;
}

export function BlockMenuLabel({ children }: BlockMenuLabelProps) {
  return (
    <DropdownMenuLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </DropdownMenuLabel>
  );
}
