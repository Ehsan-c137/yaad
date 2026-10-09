import type { SidebarPageItem } from "@yaad/core/store/use-sidebar-store";

import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { ArrowLeft, FileText, Network } from "lucide-react";
import { useTranslation } from "react-i18next";

import { GraphView } from "@/components/graph/graph-view";
import { useGraphData } from "@/components/graph/use-graph-data";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

interface GraphPageProps {
  workspaceId: string;
  /** When provided, the graph is scoped to this page and its sub-pages */
  pageId?: string;
}

export function GraphPage({ workspaceId, pageId }: GraphPageProps) {
  const pages = useSidebarStore((s) => s.pages);
  const rootPageIds = useSidebarStore((s) => s.rootPageIds);
  const { nodes, edges } = useGraphData(pages, rootPageIds, pageId);

  const page = pageId ? pages[pageId] : undefined;
  const isPageMissing =
    Boolean(pageId) && Object.keys(pages).length > 0 && !page;

  return (
    <div className="flex size-full flex-col">
      <GraphPageHeader workspaceId={workspaceId} pageId={pageId} page={page} />

      <div className="min-h-0 flex-1">
        {isPageMissing ? (
          <GraphEmptyState />
        ) : (
          <GraphView
            className="size-full"
            workspaceId={workspaceId}
            nodes={nodes}
            edges={edges}
          />
        )}
      </div>
    </div>
  );
}

interface GraphPageHeaderProps {
  workspaceId: string;
  pageId?: string;
  page?: SidebarPageItem;
}

function GraphPageHeader({ workspaceId, pageId, page }: GraphPageHeaderProps) {
  const { t } = useTranslation(["editor", "common"]);
  const pageIcon = page?.icon && page.icon !== "📄" ? page.icon : undefined;

  return (
    <div className="flex shrink-0 items-center gap-2.5 border-b border-border/50 px-6 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-sm leading-none">
        {page ? (
          pageIcon ? (
            <span role="img">{pageIcon}</span>
          ) : (
            <FileText
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          )
        ) : (
          <Network className="size-4 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>
      <h1 className="truncate text-sm font-semibold text-foreground">
        {page ? page.title || t("common:untitled") : t("editor:graphView")}
      </h1>
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
        {page ? t("editor:pageAndSubpages") : t("editor:allPagesInWorkspace")}
      </span>

      {pageId && page && (
        <Link
          href={`/workspace/${workspaceId}/${pageId}`}
          className={cn(
            "ms-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5",
            "text-xs font-medium text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" strokeWidth={1.5} />
          {t("editor:backToPage")}
        </Link>
      )}
    </div>
  );
}

function GraphEmptyState() {
  const { t } = useTranslation("editor");
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <Network className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">{t("pageNotFound")}</p>
      <p className="text-xs text-muted-foreground/70">
        {t("pageMayBeDeleted")}
      </p>
    </div>
  );
}
