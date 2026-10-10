/* eslint-disable complexity, @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-void-return, @typescript-eslint/no-floating-promises */
import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { MOBILE_NAV_HEIGHT } from "@yaad/core/constants/sizes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["sidebar", "editor"]);
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
        size="icon"
        className="rounded-full active:scale-95"
        onClick={async () => {
          const newPageId = createPage(null);
          await navigate(
            `/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`,
          );
        }}
        title={t("sidebar:createNewPage")}
      >
        <Plus className="size-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {activeBlock && <MobileBlockDrawer block={activeBlock} pageId={pageId} />}
      <Button
        size="icon"
        variant="ghost"
        className="size-8 rounded-full active:scale-95"
        onClick={handleAddBlockBelow}
        title={t("sidebar:addSubPage")}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

export function BottomMobileNav() {
  const { t } = useTranslation("sidebar");
  const navigate = useNavigate();
  const { pageId } = useParams();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isSidebarOpen = useSidebarStore((store) => store.isSidebarOpen);

  if (!isMobile || !activeWorkspace) return null;

  const handleNewPage = () => {
    const newPageId = createPage(null);
    navigate(`/${ROUTES.workspace}/${activeWorkspace}/${newPageId}`);
  };

  return (
    <nav
      style={{
        height: `${MOBILE_NAV_HEIGHT}px`,
        bottom: "max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))",
      }}
      aria-label="Mobile navigation"
      aria-hidden={isSidebarOpen}
      inert={isSidebarOpen ? true : undefined}
      className={cn(
        "fixed inset-x-4 z-30 mx-auto flex max-w-md items-center justify-between",
        "rounded-full border border-border/60 bg-background/90 px-3.5 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl",
        "dark:border-white/[0.12] dark:bg-background/85 dark:shadow-black/30",
        "transition-all duration-300 ease-(--spring)",
        isSidebarOpen &&
          "pointer-events-none select-none opacity-0 translate-y-3",
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
          size="icon"
          className="rounded-full active:scale-95"
          onClick={handleNewPage}
          title={t("createNewPage")}
        >
          <Plus className="size-4" />
        </Button>
      )}
    </nav>
  );
}
