import type { DocumentBlockType } from "../document";

export interface BlockActions {
  changeType: (type: DocumentBlockType) => void;
  applyColor: (color: string) => void;
  editIcon: () => void;
  addToFavorites: () => void;
  delete: () => void;
  duplicate: () => void;
  openInNewTab: () => void;
  openInSidePeek: () => void;
  copyLink: () => void;
  rename: () => void;
}
