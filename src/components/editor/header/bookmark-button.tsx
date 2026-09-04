import { Bookmark, BookmarkCheck } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/use-sidebar-store";

export const BookmarkButton = () => {
  const { pageId } = useParams<{ pageId: string }>();

  const isBookmarked = useSidebarStore(
    (state) => state.pages[pageId].isBookmarked,
  );
  const toggleBookmarked = useSidebarStore((state) => state.toggleBookmarked);

  return (
    <Button
      size="icon"
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      variant="ghost"
      onClick={() => toggleBookmarked(pageId)}
    >
      {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
    </Button>
  );
};
