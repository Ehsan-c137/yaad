"use client";

import { useMemo } from "react";

import { formatDate } from "@/lib/date-formatter";

interface BlockMenuFooterProps {
  author: string;
  updatedAt: number;
}

export function BlockMenuFooter({ author, updatedAt }: BlockMenuFooterProps) {
  const formattedDate = useMemo(
    () =>
      formatDate(updatedAt || Date.now(), {
        locale: "en-US",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    [updatedAt],
  );

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1.5 text-[11px] text-muted-foreground">
      <span>Last edited by {author}</span>
      <span>{formattedDate}</span>
    </div>
  );
}
