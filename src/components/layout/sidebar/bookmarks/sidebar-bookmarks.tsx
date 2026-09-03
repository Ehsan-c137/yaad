"use client";

import { Bookmark } from "lucide-react";

import { useBookmarkedPages } from "@/hooks/sidebar/use-bookmarked-pages";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarBookmarkItem } from "./sidebar-bookmark-item";

export function SidebarBookmarks() {
  const isHydrated = useSidebarStore((store) => store._hasHydrated);
  const bookmarkedPages = useBookmarkedPages();

  return (
    <>
      <SidebarBookmarksHeader count={bookmarkedPages.length} />

      {!isHydrated && (
        <div className="space-y-1.5 p-2">
          <div className={cn(styles.skeleton, "h-4 w-2/3 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-4/5 rounded-full")} />
          <div className={cn(styles.skeleton, "h-4 w-1/2 rounded-full")} />
        </div>
      )}

      {isHydrated && bookmarkedPages.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center select-none">
          <Bookmark strokeWidth={1} className="vibrancy-tertiary size-9" />
          <p className="text-sf-footnote vibrancy-secondary leading-relaxed">
            No bookmarks yet.
            <br />
            Bookmark pages to quickly access them here.
          </p>
        </div>
      )}

      {isHydrated && bookmarkedPages.length > 0 && (
        <nav className="pb-2" aria-label="Bookmarked Pages">
          {bookmarkedPages.map((page) => (
            <SidebarBookmarkItem key={page.id} pageId={page.id} />
          ))}
        </nav>
      )}
    </>
  );
}

function SidebarBookmarksHeader({ count }: { count: number }) {
  return (
    <div
      className={cn(
        styles.sectionLabel,
        "flex items-center justify-between px-2 pt-3 pb-1",
      )}
    >
      <span>Bookmarked</span>
      {count > 0 && (
        <span className="text-[11px] font-normal text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}
