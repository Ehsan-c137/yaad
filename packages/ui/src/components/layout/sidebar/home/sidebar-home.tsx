import { Button, buttonVariants } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { FileText, Network, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { SearchBox } from "@/components/search/search-command";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import {
  resetDndState,
  useSidebarDndStore,
} from "@/hooks/sidebar/use-sidebar-dnd";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";
import { isFirefox } from "@/lib/browser";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SidebarPageItem } from "./sidebar-item/sidebar-page-item";

export function SidebarHome() {
  const { t } = useTranslation("sidebar");
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
            {t("noPagesYet")}
            <br />
            {t("createToGetStarted")}
          </p>
        </div>
      )}

      {rootPageIds.length > 0 && (
        <nav className="pb-2" aria-label="Pages">
          {rootPageIds.map((pageId) => (
            <SidebarPageItem key={pageId} pageId={pageId} />
          ))}
          <SidebarRootDropZone />
        </nav>
      )}
    </>
  );
}

function SidebarRootDropZone() {
  const { t } = useTranslation("sidebar");
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { isReadOnly } = useWorkspacePermissions(activeWorkspaceId);
  const rootPageIds = useSidebarStore((s) => s.rootPageIds);
  const movePageInTree = useSidebarStore((s) => s.movePageInTree);
  const { draggedPageId } = useSidebarDndStore();
  const [isOver, setIsOver] = useState(false);

  if (!draggedPageId || isReadOnly || rootPageIds.length === 0) return null;

  const lastRootId = rootPageIds[rootPageIds.length - 1];
  if (lastRootId === draggedPageId) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    if (!draggedPageId || !lastRootId) return;
    await movePageInTree(draggedPageId, lastRootId, "after");
    resetDndState();
  };

  return (
    <div
      data-testid="sidebar-root-drop-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => void handleDrop(e)}
      className={cn(
        "my-1.5 h-7 w-full rounded-full border border-dashed transition-all duration-(--spring-duration) ease-(--spring) flex items-center justify-center text-xs select-none",
        isOver
          ? "border-(--accent-blue) bg-(--accent-blue-tint) text-(--accent-blue) font-medium shadow-xs"
          : "border-border/50 text-muted-foreground/70 hover:border-border",
      )}
    >
      <span>{t("moveToRoot")}</span>
    </div>
  );
}

function SidebarHomeHeader() {
  const { t } = useTranslation("sidebar");
  const { pathname } = useLocation();
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );
  const { isReadOnly } = useWorkspacePermissions(activeWorkspaceId);
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

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
              aria-label={t("graphView")}
              title={t("graphView")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "rounded-full",
                isGraphActive && "bg-muted text-foreground",
              )}
            >
              <Network className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href={`/workspace/${activeWorkspaceId}/trash`}
              aria-label={t("goToTrash")}
              title={t("trashPage")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "rounded-full",
                isTrashActive && "bg-muted text-foreground",
              )}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Link>
            <SearchBox
              triggerClassName={
                isSidebarOpen && !isFirefox()
                  ? "sidebar-search-button"
                  : undefined
              }
            />
          </div>
        )}
      </div>
      <Separator />
      <div className="text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
        <span>{t("private")}</span>

        {!isReadOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void createPage(null)}
            title={t("createPage")}
            aria-label={t("createNewPage")}
            className="text-muted-foreground hover:text-(--accent-blue)"
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
