import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { MOBILE_NAV_HEIGHT } from "@yaad/core/constants/sizes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { MobileBlockDrawer } from "@/components/editor/menu/mobile-block-drawer";
import { SearchBox } from "@/components/search/search-command";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { EditorPageIdProvider } from "@/providers/document-provider";

interface MobileEditorNavActionsProps {
  pageId: string;
  activeWorkspace: string;
}

function MobileEditorNavActions({
  pageId,
  activeWorkspace,
}: MobileEditorNavActionsProps) {
  const navigate = useNavigate();
  const createPage = useSidebarStore((store) => store.createPage);
  const currentDocument = useDocumentStore(
    (state) => state.currentDocument,
    pageId,
  );
  const activeBlockId = useDocumentStore(
    (state) => state.activeBlockId,
    pageId,
  );
  const addBlock = useDocumentStore((state) => state.addBlock, pageId);

  const isEditorPage = Boolean(
    pageId && currentDocument && currentDocument.id === pageId,
  );

  const rootChildren = currentDocument?.blocks?.root?.childrenIds ?? [];
  const effectiveBlockId =
    (activeBlockId && currentDocument?.blocks?.[activeBlockId]
      ? activeBlockId
      : null) ??
    (rootChildren.length > 0 ? rootChildren[rootChildren.length - 1] : null);

  const activeBlock = effectiveBlockId
    ? currentDocument?.blocks?.[effectiveBlockId]
    : null;

  const handleAddBlockBelow = async () => {
    if (activeBlock) {
      await addBlock(
        activeBlock.parentId ?? "root",
        activeBlock.id,
        "paragraph",
      );
    } else {
      await addBlock("root", "root", "paragraph");
    }
  };

  if (!isEditorPage) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={async () => {
          const newPageId = createPage(null);
          await navigate(
            `/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`,
          );
        }}
        title="Create new page"
      >
        <Plus />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {activeBlock && <MobileBlockDrawer block={activeBlock} pageId={pageId} />}
      <Button
        size="icon"
        variant="ghost"
        className="size-8 rounded-lg active:scale-95"
        onClick={handleAddBlockBelow}
        title="Add block below"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

export function BottomMobileNav() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId);

  if (!isMobile || !activeWorkspace) return null;

  const handleNewPage = () => {
    const newPageId = createPage(null);
    navigate(`/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`);
  };

  return (
    <nav
      style={{ height: `${MOBILE_NAV_HEIGHT}px` }}
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-0 left-0 z-40 flex w-full items-center justify-between bg-background/95 backdrop-blur-md",
        "border-t border-border/40 px-3 py-1.5",
        "safe-area-pb",
      )}
    >
      <SearchBox />

      {pageId ? (
        <EditorPageIdProvider pageId={pageId}>
          <MobileEditorNavActions
            pageId={pageId}
            activeWorkspace={activeWorkspace}
          />
        </EditorPageIdProvider>
      ) : (
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={handleNewPage}
          title="Create new page"
        >
          <Plus />
        </Button>
      )}
    </nav>
  );
}
