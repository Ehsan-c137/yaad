"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  control?: ReactNode;
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  control,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "mx-2 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        "transition-colors duration-(--press-duration)",
        "hover:bg-foreground/4",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--accent-blue-subtle) text-(--accent-blue)">
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm leading-none font-medium text-foreground">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs/snug text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}
