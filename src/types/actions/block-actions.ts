import type { DocumentBlockType } from "../document";

export interface BlockColorUpdate {
  bgColor?: string;
  textColor?: string;
}

export interface BlockActions {
  changeType: (type: DocumentBlockType) => void;
  applyColor: (color: BlockColorUpdate) => void;
  duplicate: () => void;
  delete: () => void;
  copyLink: () => void;
  openInNewTab: () => void;
  openInSidePeek: () => void;
}
