import type { SidebarPageItem } from "@yaad/core/store/use-sidebar-store";

import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";

export function useBookmarkedPages() {
  const pages = useSidebarStore((state) => state.pages);

  const bookmarkedPages = Object.values(pages).filter(
    (page): page is SidebarPageItem => page!.isBookmarked! && !page!.isDeleted!,
  );

  return bookmarkedPages;
}
