"use client";

import { Separator } from "@ui/separator";

export function SeparatorBlock() {
  return (
    <div className="flex size-full h-8 items-center">
      <Separator />
    </div>
  );
}

/** @deprecated Use SeparatorBlock instead */
export const SeperatorBlock = SeparatorBlock;
