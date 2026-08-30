export type SearchItemCategory = "action" | "page" | "recent";

export interface SearchItem {
  category: SearchItemCategory;
  icon?: string;
  id: string;
  lastAccessedAt?: number;
  pageId: string;
  subtitle?: string;
  title: string;
  workspaceId: string;
}
