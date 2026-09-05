import type { SidebarPageItem } from "@/store/use-sidebar-store";

import { useSidebarStore } from "@/store/use-sidebar-store";

export function useBookmarkedPages() {
  const pages = useSidebarStore((state) => state.pages);

  const bookmarkedPages = Object.values(pages).filter(
    (page): page is SidebarPageItem =>
      page !== undefined && page.isBookmarked && !page.isDeleted,
  );

  return bookmarkedPages;
}
