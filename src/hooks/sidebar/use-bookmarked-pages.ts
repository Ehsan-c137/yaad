import { useSidebarStore } from "@/store/use-sidebar-store";

export function useBookmarkedPages() {
  const pages = useSidebarStore((state) => state.pages);

  const favoritPages = Object.values(pages).filter(
    (page) => page.isBookmarked && !page.isDeleted,
  );

  return favoritPages;
}
