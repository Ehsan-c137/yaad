import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { SearchItem } from "@/types/search";

import { ROUTES } from "@/constants/routes";
import { useRecentPages } from "@/hooks/search/use-recent-pages";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";

import { DocsListItem } from "./docs-list";

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
  const recentDocs = useRecentPages(limit, workspaceId);

  const router = useRouter();
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
      router.push(`/${ROUTES.workspace}/${item.workspaceId}/${item.pageId}`);
    },
    [openTab, router],
  );

  if (recentDocs.length === 0) {
    return (
      <section className="mt-12">
        <h2 className={cn(styles.sectionLabel)}>Recent</h2>
        <p className="px-2 py-1.5 text-sm text-muted-foreground">
          No pages yet — create one from the sidebar to see it here.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className={cn(styles.sectionLabel, "flex items-center gap-1.5")}>
        <Clock aria-hidden className="size-3" />
        Recent
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
