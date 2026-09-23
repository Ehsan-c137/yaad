"use client";

import { styles } from "@yaad/core/lib/design-token";
import { Keyboard } from "lucide-react";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function KeyboardSection() {
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>Keyboard</p>

      <SettingsRow
        icon={<Keyboard className="size-3.5" strokeWidth={1.5} />}
        title="Quick open"
        subtitle="Open a page by name"
        control={
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <kbd className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5">
              âŒ˜K
            </kbd>
            <span className="opacity-60">/</span>
            <kbd className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5">
              Ctrl+K
            </kbd>
          </div>
        }
      />
    </>
  );
}
