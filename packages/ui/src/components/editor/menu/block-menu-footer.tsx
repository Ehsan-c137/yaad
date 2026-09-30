"use client";

import { formatDate } from "@yaad/core/lib/date-formatter";
import { useMemo } from "react";

import { useTranslation } from "react-i18next";

interface BlockMenuFooterProps {
  author: string;
  updatedAt: number;
}

export function BlockMenuFooter({ author, updatedAt }: BlockMenuFooterProps) {
  const { t, i18n } = useTranslation("editor");
  const formattedDate = useMemo(
    () =>
      formatDate(updatedAt || Date.now(), {
        locale: i18n.language?.startsWith("fa") ? "fa-IR" : "en-US",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    [updatedAt, i18n.language],
  );

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1.5 text-[11px] text-muted-foreground">
      <span>{t("lastEditedBy", { author })}</span>
      <span>{formattedDate}</span>
    </div>
  );
}
