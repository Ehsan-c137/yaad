import { ROUTES } from "@yaad/core/constants/routes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { EditableContent } from "@/components/editor/block/editable-content";
import { Link } from "@/components/ui/link";
import { useEditorPermissions } from "@/context/editor-permissions-context";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

import { Button } from "@ui/button";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Eye, Network, Share2 } from "lucide-react";
import { ShareModal } from "@/components/workspace/share-modal";

import { BookmarkButton } from "./bookmark-button";
import { CollabPresence } from "./collab-presence";
import { PageHeaderCover } from "./cover/page-header-cover";
import { PageIcon } from "./icon/page-icon";
import { PageHeaderTags } from "./page-header-tags";
import { SyncStatusIndicator } from "./sync-status-indicator";

export function PageHeader() {
  const { t } = useTranslation(["common", "editor"]);
  const { isReadOnly } = useEditorPermissions();
  const { workspaceId = "ws_personal", pageId } = useParams<{
    workspaceId: string;
    pageId: string;
  }>();
  const workspace = useWorkspaceStore((state) => state.workspaces[workspaceId]);
  const token = useUserStore((state) => state.token);
  const isLoggedIn = Boolean(token);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="group/header relative flex w-full flex-col">
      <PageHeaderCover />

      <div className="mx-auto w-full max-w-3xl px-6 pt-4">
        <div className="flex items-center justify-between">
          <PageIcon />
          <div className="flex flex-wrap justify-end items-center gap-2">
            {isReadOnly && (
              <div
                className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 select-none"
                title={t(
                  "common:viewOnlyDesc",
                  "You have read-only access to this workspace.",
                )}
              >
                <Eye className="size-3.5" />
                <span>{t("common:viewOnly", "View only")}</span>
              </div>
            )}
            {isLoggedIn && (
              <>
                <SyncStatusIndicator />
                <CollabPresence />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setIsShareOpen(true)}
                  className="gap-1.5 rounded-full border-border/40 text-xs font-medium text-foreground hover:bg-foreground/5 shadow-2xs"
                >
                  <Share2 className="size-3.5 text-muted-foreground" />
                  <span>{t("common:share")}</span>
                </Button>
              </>
            )}
            <BookmarkButton />
          </div>
        </div>
        <PageHeaderTitle />
        <PageHeaderTags />
      </div>

      {isLoggedIn && (
        <ShareModal
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          workspaceId={workspaceId}
          workspaceName={workspace?.name}
          workspaceIcon={workspace?.icon}
          pageId={pageId}
        />
      )}
    </div>
  );
}

function PageHeaderTitle() {
  const { t } = useTranslation(["editor", "common"]);
  const { isReadOnly } = useEditorPermissions();
  const { pageId: routePageId, workspaceId } = useParams<{
    pageId: string;
    workspaceId: string;
  }>();
  const contextPageId = useEditorPageIdContext();
  const pageId = contextPageId || routePageId;

  const sidebarTitle = useSidebarStore((state) =>
    pageId ? state.pages[pageId]?.title : undefined,
  );
  const documentTitle = useDocumentStore((state) => {
    const doc = state.currentDocument;
    if (!doc) return undefined;
    const rootId = doc.rootBlockId || "root";
    return (
      doc.blocks?.[rootId]?.properties?.title?.[0]?.text ??
      doc.blocks?.root?.properties?.title?.[0]?.text ??
      doc.title
    );
  });
  const updateTitle = useDocumentStore((state) => state.updateTitle);

  const titleText = documentTitle ?? sidebarTitle ?? "";

  const [prevPageId, setPrevPageId] = useState(pageId);
  const [prevTitle, setPrevTitle] = useState(titleText);
  const [exitingTitle, setExitingTitle] = useState<{
    id: string;
    text: string;
  } | null>(null);

  if (pageId !== prevPageId) {
    setPrevPageId(pageId);
    setExitingTitle({ id: prevPageId ?? "", text: prevTitle });
  }

  useEffect(() => {
    setPrevTitle(titleText);
  }, [titleText]);

  useEffect(() => {
    if (!exitingTitle) return;
    const timer = setTimeout(() => {
      setExitingTitle(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [exitingTitle]);

  const handleTitleChange = async (newTitle: string) => {
    if (isReadOnly) return;
    await updateTitle(newTitle);
  };

  return (
    <div className="py-3 relative flex w-full items-center">
      {exitingTitle && (
        <div
          key={`exiting-${exitingTitle.id}`}
          className="pointer-events-none absolute start-0 top-3 leading-tight font-bold tracking-tight text-foreground md:text-[2.75rem] animate-page-title-outro select-none"
          aria-hidden="true"
          onAnimationEnd={() => setExitingTitle(null)}
        >
          {exitingTitle.text || t("common:untitled")}
        </div>
      )}
      <EditableContent
        key={pageId}
        html={titleText}
        placeholder={t("common:untitled")}
        readOnly={isReadOnly}
        className="leading-tight font-bold tracking-tight text-foreground md:text-[2.75rem] animate-page-title"
        onChange={(newTitle: string) => {
          void handleTitleChange(newTitle);
        }}
      />
      <Link
        href={`/${ROUTES.workspace}/${encodeURI(workspaceId ?? "")}/${encodeURI(pageId ?? "")}/graph`}
        title={t("editor:graphView")}
        aria-label={t("editor:graphView")}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-xl",
          "text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-250 ease-(--spring)",
          "hover:bg-foreground/[0.06] hover:text-foreground active:scale-95",
          "animate-page-graph",
        )}
      >
        <Network className="size-4" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
