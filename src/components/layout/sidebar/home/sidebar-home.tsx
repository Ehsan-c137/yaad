"use client";

import { Button } from "@ui/button";
import { FileText, Network, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { SidebarPageItem } from "./sidebar-item/sidebar-page-item";

export function SidebarHome() {
  const isHydrated = useSidebarStore((store) => store._hasHydrated);
  const rootPageIds = useSidebarStore((store) => store.rootPageIds);

  return (
    <>
      <SidebarHomeHeader />
      {!isHydrated && (
        <div className="space-y-1.5 p-2">
          <div className={cn(styles.skeleton, "h-4 w-2/3 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-4/5 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-1/2 rounded-full")} />
        </div>
      )}

      {isHydrated && rootPageIds.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <FileText strokeWidth={1} className="vibrancy-tertiary size-9" />
          <p className="text-sf-footnote vibrancy-secondary leading-relaxed">
            No pages yet.
            <br />
            Create one to get started.
          </p>
        </div>
      )}

      {rootPageIds.length > 0 && (
        <nav className="pb-2" aria-label="Pages">
          {rootPageIds.map((pageId) => (
            <SidebarPageItem key={pageId} pageId={pageId} />
          ))}
        </nav>
      )}
    </>
  );
}

function SidebarHomeHeader() {
  const pathname = usePathname();
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );

  const isGraphActive =
    Boolean(activeWorkspaceId) &&
    pathname === `/workspace/${activeWorkspaceId}/graph`;
  const isTrashActive =
    Boolean(activeWorkspaceId) &&
    pathname === `/workspace/${activeWorkspaceId}/trash`;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-1">
        {activeWorkspaceId && (
          <div className="flex items-center gap-1">
            <Link
              href={`/workspace/${activeWorkspaceId}/graph`}
              title="Graph View"
              aria-label="Graph View"
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg",
                "text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                isGraphActive && "bg-muted text-foreground",
              )}
            >
              <Network className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href={`/workspace/${activeWorkspaceId}/trash`}
              title="Trash"
              aria-label="Go to Trash"
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg",
                "text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                isTrashActive && "bg-muted text-foreground",
              )}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </div>
      <Separator />
      <div
        className={cn(
          styles.sectionLabel,
          "flex items-center justify-between pt-3 pb-1",
        )}
      >
        <span>Private</span>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => createPage(null)}
          title="Create page"
          aria-label="Create new page"
          className="relative text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-(--accent-blue)"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
