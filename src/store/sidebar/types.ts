export interface SidebarPageItem {
  id: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  isExpanded?: boolean;
  isFavorite?: boolean;
  updatedAt?: number;
}

export interface SidebarUiSlice {
  _hasHydrated: boolean;
  isLoading: boolean;
  isSidebarOpen: boolean;
  activePageId: string | null;
  // Actions
  setHasHydrated: (state: boolean) => void;
  setIsLoading: (state: boolean) => void;
  toggleSidebar: () => void;
  setActivePageId: (pageId: string) => void;
}

export interface SidebarPagesSlice {
  pages: Record<string, SidebarPageItem>;
  rootPageIds: string[];
  // Actions
  loadWorkspacePages: (workspaceId: string) => Promise<void>;
  toggleExpand: (pageId: string) => void;
  toggleFavorite: (pageId: string) => void;
  duplicatePage: (pageId: string) => Promise<string | null>;
  createPage: (parentId: string | null) => string;
  deletePage: (pageId: string) => void;
  /* eslint-disable-next-line max-params */
  registerSubPageInTree: (
    newPageId: string,
    parentDocId: string,
    title: string,
    icon?: string,
  ) => void;
  updatePageTitleInTree: (
    pageId: string,
    title?: string,
    icon?: string,
  ) => void;
  removePageFromTree: (pageId: string) => void;
}

export type SidebarState = SidebarPagesSlice & SidebarUiSlice;
