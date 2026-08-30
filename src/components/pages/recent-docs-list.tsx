import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { SearchItem } from "@/types/search";

import { ROUTES } from "@/constants/routes";
import { useRecentPages } from "@/hooks/search/use-recent-pages";
import { formatRelativeTime } from "@/lib/date-formatter";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";

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
  const router = useRouter();
  const openTab = useTabStore((s) => s.openTab);
  const sidebarPages = useSidebarStore((s) => s.pages);
  const recentDocs = useRecentPages(limit, workspaceId);

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
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleOpenDoc(item)}
                className={cn(
                  styles.listRow,
                  "w-full cursor-pointer text-left",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-sm select-none">
                  {item.icon ?? "📄"}
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {item.title}
                </span>
                {parentTitle ? (
                  <span className="hidden shrink-0 text-xs text-muted-foreground/80 sm:inline">
                    In {parentTitle}
                  </span>
                ) : null}
                {item.lastAccessedAt ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">
                    {formatRelativeTime(item.lastAccessedAt)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
