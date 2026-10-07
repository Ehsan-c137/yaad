/* eslint-disable @typescript-eslint/no-floating-promises, perfectionist/sort-imports */
import type { SearchItem } from "@yaad/core/types/search";

import { ROUTES } from "@yaad/core/constants/routes";
import { styles } from "@/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { Clock } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useRecentPages } from "@/hooks/search/use-recent-pages";
import { cn } from "@/lib/utils";

import { DocsListItem } from "./docs-list-item";

const DEFAULT_LIMIT = 10;

interface RecentDocsListProps {
  workspaceId: string;
  /** Maximum number of recent docs to show. */
  limit?: number;
}

export function RecentDocsList({
  workspaceId,
  limit = DEFAULT_LIMIT,
}: RecentDocsListProps) {
  const { t } = useTranslation("common");
  const recentDocs = useRecentPages(limit, workspaceId);

  const navigate = useNavigate();
  const openTab = useTabStore((s) => s.openTab);
  const sidebarPages = useSidebarStore((s) => s.pages);

  const handleOpenDoc = useCallback(
    (item: SearchItem) => {
      openTab({
        pageId: item.pageId,
        workspaceId: item.workspaceId,
        title: item.title,
        icon: item.icon,
      });
      navigate(`/${ROUTES.workspace}/${item.workspaceId}/${item.pageId}`);
    },
    [openTab, navigate],
  );

  if (recentDocs.length === 0) {
    return (
      <section className="mt-12">
        <h2 className={cn(styles.sectionLabel)}>{t("recent")}</h2>
        <p className="px-2 py-1.5 text-sm text-muted-foreground">
          {t("noRecentPagesHint")}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className={cn(styles.sectionLabel, "flex items-center gap-1.5")}>
        <Clock aria-hidden className="size-3" />
        {t("recent")}
      </h2>
      <ul className="flex flex-col">
        {recentDocs.map((item) => {
          const pageMeta = sidebarPages[item.pageId];
          const parentTitle = pageMeta?.parentId
            ? sidebarPages[pageMeta.parentId]?.title
            : undefined;

          return (
            <DocsListItem
              key={item.pageId}
              item={item}
              pageMeta={pageMeta}
              parentTitle={parentTitle}
              onOpenDoc={() => handleOpenDoc(item)}
            />
          );
        })}
      </ul>
    </section>
  );
}
