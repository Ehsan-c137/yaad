import { Bookmark, BookmarkCheck } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

export const BookmarkButton = () => {
  const { pageId } = useParams<{ pageId: string }>();

  const isBookmarked = useSidebarStore(
    (state) => state.pages[pageId].isBookmarked,
  );
  const toggleBookmarked = useSidebarStore((state) => state.toggleBookmarked);

  return (
    <Button
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      variant="ghost"
      onClick={() => {
        toggleBookmarked(pageId);
      }}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg",
        "text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
      )}
    >
      {isBookmarked ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
    </Button>
  );
};
