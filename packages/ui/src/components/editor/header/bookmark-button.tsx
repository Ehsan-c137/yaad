import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useEditorPageIdContext } from "@/context/use-editor-context";
import { cn } from "@/lib/utils";

export const BookmarkButton = () => {
  const { t } = useTranslation("editor");
  const { pageId: routePageId } = useParams<{ pageId?: string }>();
  const contextPageId = useEditorPageIdContext();
  const pageId = contextPageId || routePageId;

  const isBookmarked = useSidebarStore((state) =>
    pageId ? state.pages[pageId]?.isBookmarked : false,
  );
  const toggleBookmarked = useSidebarStore((state) => state.toggleBookmarked);

  const label = isBookmarked ? t("removeFromBookmarks") : t("addToBookmarks");

  return (
    <Button
      size="icon"
      title={label}
      aria-label={label}
      variant="ghost"
      className={cn("animate-page-bookmark")}
      disabled={!pageId}
      onClick={() => {
        if (pageId) toggleBookmarked(pageId);
      }}
    >
      {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
    </Button>
  );
};
