import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";

export const BookmarkButton = () => {
  const { pageId } = useParams<{ pageId?: string }>();

  const isBookmarked = useSidebarStore((state) =>
    pageId ? state.pages[pageId]?.isBookmarked : false,
  );
  const toggleBookmarked = useSidebarStore((state) => state.toggleBookmarked);

  return (
    <Button
      size="icon"
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
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
