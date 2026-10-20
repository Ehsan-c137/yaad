import { Button } from "@ui/button";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  resetDndState,
  useSidebarDndStore,
} from "@/hooks/sidebar/use-sidebar-dnd";
import { useWorkspacePermissions } from "@/hooks/workspace/use-workspace-permissions";
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

export function SidebarHomeHeader({
  showPrivateSection = true,
}: {
  showPrivateSection?: boolean;
} = {}) {
  const { t } = useTranslation("sidebar");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspaceId = useWorkspaceStore(
    (store) => store.activeWorkspaceId,
  );
  const { isReadOnly } = useWorkspacePermissions(activeWorkspaceId);

  if (!activeWorkspaceId || !showPrivateSection) return null;

  return (
    <div
      className={cn(
        styles.sectionLabel,
        "flex items-center justify-between px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest",
      )}
    >
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
  );
}
