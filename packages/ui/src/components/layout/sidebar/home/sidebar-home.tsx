import { Button } from "@ui/button";
import { styles } from "@yaad/core/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { FileText, Network, Plus, Trash2 } from "lucide-react";
import { useLocation } from "react-router";

import { SearchBox } from "@/components/search/search-command";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
          <p className="text-sm vibrancy-secondary leading-relaxed">
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
  const { pathname } = useLocation();
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );

  if (!activeWorkspaceId) return null;

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
              aria-label="Graph View"
              className={cn(
                isGraphActive && "bg-muted text-foreground",
                "rounded-full",
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Trash page"
              >
                <Network className="size-4" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link
              href={`/workspace/${activeWorkspaceId}/trash`}
              aria-label="Go to Trash"
              className={cn(
                isTrashActive && "bg-muted text-foreground",
                "rounded-full",
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Trash page"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </Button>
            </Link>
            <SearchBox />
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
          onClick={() => void createPage(null)}
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
