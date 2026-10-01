import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export const BookmarkButton = () => {
  const { t } = useTranslation("editor");
  const { pageId } = useParams<{ pageId?: string }>();

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
      disabled={!pageId}
      onClick={() => {
        if (pageId) toggleBookmarked(pageId);
      }}
    >
      {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
    </Button>
  );
};
