"use client";

import { ArrowLeft, FileText, Network } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { useGraphData } from "@/components/graph/use-graph-data";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

const GraphView = dynamic(
  () => import("@/components/graph/graph-view").then((m) => m.GraphView),
  { ssr: false },
);

interface GraphPageProps {
  workspaceId: string;
  /** When provided, the graph is scoped to this page and its sub-pages */
  pageId?: string;
}

export default function GraphPage({ workspaceId, pageId }: GraphPageProps) {
  const pages = useSidebarStore((s) => s.pages);
  const rootPageIds = useSidebarStore((s) => s.rootPageIds);
  const { nodes, edges } = useGraphData(pages, rootPageIds, pageId);

  const page = pageId ? pages[pageId] : undefined;
  const isPageMissing =
    Boolean(pageId) && Object.keys(pages).length > 0 && !page;

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col">
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
        {page ? page.title || "Untitled" : "Graph View"}
      </h1>
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
        {page ? "This page and its sub-pages" : "All pages in this workspace"}
      </span>

      {pageId && page && (
        <Link
          href={`/workspace/${workspaceId}/${pageId}`}
          className={cn(
            "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5",
            "text-xs font-medium text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          Back to page
        </Link>
      )}
    </div>
  );
}

function GraphEmptyState() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <Network className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">Page not found</p>
      <p className="text-xs text-muted-foreground/70">
        This page may have been deleted.
      </p>
    </div>
  );
}
