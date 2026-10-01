import { ROUTES } from "@yaad/core/constants/routes";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { EditableContent } from "@/components/editor/block/editable-content";
import { Link } from "@/components/ui/link";
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
  const titleText = useDocumentStore(
    (state) =>
      state.currentDocument?.blocks.root.properties.title[0]?.text ?? "",
  );
  const updateTitle = useDocumentStore((state) => state.updateTitle);
  const { workspaceId, pageId } = useParams<{
    workspaceId: string;
    pageId: string;
  }>();

  const handleTitleChange = async (newTitle: string) => {
    await updateTitle(newTitle);
  };

  return (
    <div className="py-3 flex w-full items-center">
      <EditableContent
        html={titleText}
        placeholder={t("common:untitled")}
        className="text-sf-large-title leading-tight font-bold tracking-tight text-foreground md:text-[2.75rem]"
        onChange={handleTitleChange}
      />
      <Link
        href={`/${ROUTES.workspace}/${encodeURI(workspaceId ?? "")}/${encodeURI(pageId ?? "")}/graph`}
        title={t("editor:graphView")}
        aria-label={t("editor:graphView")}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-xl",
          "text-muted-foreground transition-[background-color,color,box-shadow,transform] duration-250 ease-(--spring)",
          "hover:bg-foreground/[0.06] hover:text-foreground active:scale-95",
        )}
      >
        <Network className="size-4" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
