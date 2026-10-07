import { ROUTES } from "@yaad/core/constants/routes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Network } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { EditableContent } from "@/components/editor/block/editable-content";
import { Link } from "@/components/ui/link";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";
import { cn } from "@/lib/utils";

import { BookmarkButton } from "./bookmark-button";
import { PageHeaderCover } from "./cover/page-header-cover";
import { PageIcon } from "./icon/page-icon";
import { PageHeaderTags } from "./page-header-tags";

export function PageHeader() {
  return (
    <div className="group/header relative flex w-full flex-col">
      <PageHeaderCover />

      <div className="mx-auto w-full max-w-3xl px-6 pt-4">
        <div className="flex items-center justify-between">
          <PageIcon />
          <BookmarkButton />
        </div>
        <PageHeaderTitle />
        <PageHeaderTags />
      </div>
    </div>
  );
}

function PageHeaderTitle() {
  const { t } = useTranslation(["editor", "common"]);
  const { pageId: routePageId, workspaceId } = useParams<{
    pageId: string;
    workspaceId: string;
  }>();
  const contextPageId = useEditorPageIdContext();
  const pageId = contextPageId || routePageId;

  const sidebarTitle = useSidebarStore((state) =>
    pageId ? state.pages[pageId]?.title : undefined,
  );
  const documentTitle = useDocumentStore(
    (state) => state.currentDocument?.blocks.root.properties!.title[0]?.text,
  );
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
