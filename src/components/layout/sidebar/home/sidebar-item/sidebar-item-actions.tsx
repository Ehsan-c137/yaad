import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Network,
  Plus,
  Sidebar as SidePeekIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useSidePeek } from "@/hooks/editor/use-side-peek";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface SidebarActionsProps {
  page: SidebarPageItem;
  workspaceId?: string;
  isMobile?: boolean;
  setIsOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
}

export function SidebarActions({
  page,
  workspaceId: workspaceIdProp,
  isMobile,
  setIsOpen,
  setIsDeleteDialogOpen,
}: SidebarActionsProps) {
  const router = useRouter();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaceId = workspaceIdProp ?? activeWorkspaceId ?? "";

  const [isDuplicating, setIsDuplicating] = useState(false);

  const duplicatePage = useSidebarStore((s) => s.duplicatePage);
  const toggleBookmarked = useSidebarStore((s) => s.toggleBookmarked);
  const createSubpage = useDocumentStore((s) => s.addSubPageBlock, page.id);
  const { openSidePeek } = useSidePeek();

  const pageId = page.id;

  const handleToggleBookmarked = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleBookmarked(pageId);
      setIsOpen(false);
    },
    [toggleBookmarked, pageId, setIsOpen],
  );

  const handleDuplicate = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDuplicating(true);
      const newPageId = await duplicatePage(pageId);
      setIsDuplicating(false);
      setIsOpen(false);

      if (newPageId && workspaceId) {
        router.push(`/${ROUTES.workspace}/${workspaceId}/${newPageId}`);
      }
    },
    [duplicatePage, pageId, setIsOpen, workspaceId, router],
  );

  const handleAddSubPage = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const newPageId = await createSubpage(pageId);
      setIsOpen(false);

      if (newPageId && workspaceId) {
        router.push(`/${ROUTES.workspace}/${workspaceId}/${newPageId}`);
      }
    },
    [createSubpage, pageId, setIsOpen, workspaceId, router],
  );

  const handleViewGraph = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(false);
      router.push(`/${ROUTES.workspace}/${workspaceId}/${pageId}/graph`);
    },
    [workspaceId, pageId, router, setIsOpen],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDeleteDialogOpen(true);
    },
    [setIsDeleteDialogOpen],
  );

  /* On mobile (Drawer), use larger hit targets */
  const itemClass = cn(
    styles.menuItem,
    isMobile ? "min-h-[44px] py-3 text-sm" : "py-1.5 text-xs",
    "w-full cursor-pointer justify-start gap-2 text-foreground hover:bg-foreground/6",
  );

  return (
    <div className="flex w-full flex-col gap-0.5">
      {/* Page header */}
      <div className="flex items-center gap-2 border-b border-border/40 px-2 py-1.5 text-xs font-medium text-foreground">
        <span className="text-sm">{page.icon ?? "📄"}</span>
        <span className="truncate font-semibold">
          {page.title || "Untitled"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-0.5 py-1">
        <Button
          variant="outline"
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className={cn(itemClass, "disabled:opacity-50")}
        >
          <Copy className="size-3.5 text-muted-foreground" />
          <span>{isDuplicating ? "Duplicating…" : "Duplicate"}</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleToggleBookmarked}
          className={itemClass}
        >
          {page.isBookmarked ? (
            <>
              <BookmarkCheck className="size-3.5 text-(--accent-blue)" />
              <span>Remove from bookmarks</span>
            </>
          ) : (
            <>
              <Bookmark className="size-3.5 text-muted-foreground" />
              <span>Add to bookmarks</span>
            </>
          )}
        </Button>

        {!isMobile && (
          <Button
            variant="outline"
            onClick={() => openSidePeek(pageId)}
            className={itemClass}
          >
            <SidePeekIcon className="size-3.5" />
            <span>Open in Sidepeek</span>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleAddSubPage}
          className={itemClass}
        >
          <Plus className="size-3.5 text-muted-foreground" />
          <span>Add sub-page</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleViewGraph}
          className={itemClass}
        >
          <Network className="size-3.5 text-muted-foreground" />
          <span>View graph</span>
        </Button>
      </div>

      <div className="my-1 h-px bg-border/40" />

      <Button
        variant="outline"
        onClick={handleDeleteClick}
        className={cn(
          styles.menuItem,
          isMobile ? "min-h-[44px] py-3 text-sm" : "py-1.5 text-xs",
          "w-full cursor-pointer justify-start gap-2 text-destructive hover:bg-destructive/10",
        )}
      >
        <Trash2 className="size-3.5" />
        <span>Delete page</span>
      </Button>
    </div>
  );
}
