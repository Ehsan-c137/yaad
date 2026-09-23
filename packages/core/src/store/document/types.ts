import type {
  DocumentBlockType,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";

export interface DocumentCoreSlice {
  currentDocument: DocumentJSON | null;
  isSaving: boolean;
  _hasHydrated: boolean;
  loadDocument: (id: string) => Promise<void>;
  saveCurrentDocumentImmediately: () => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
}

export interface DocumentBlockSlice {
  focusedBlockId: string | null;
  setFocusedBlockId: (blockId: string | null) => void;
  updateBlockProperties: (
    blockId: string,
    pageId: string,
    properties: Record<string, any>,
  ) => Promise<void>;
  updateBlockTags: (
    blockId: string,
    pageId: string,
    tags: Tag[],
  ) => Promise<void>;
  addTagToBlock: (blockId: string, pageId: string, tag: Tag) => Promise<void>;
  removeTagFromBlock: (
    blockId: string,
    pageId: string,
    tagId: string,
  ) => Promise<void>;
  addBlock: (
    parentId: string,
    afterBlockId: string,
    type: DocumentBlockType,
  ) => Promise<string>;
  addSubPageBlock: (parentPageId: string) => Promise<string | null>;
  deleteBlock: (blockId: string) => Promise<void>;
  changeBlockType: (
    blockId: string,
    newType: DocumentBlockType,
  ) => Promise<void>;
  duplicateBlock: (blockId: string) => Promise<void>;
}

export interface DocumentMetaSlice {
  updateTitle: (newTitleText: string) => Promise<void>;
  updateCoverImage: (coverUrl: string) => Promise<void>;
  removeCoverImage: () => Promise<void>;
  updateIcon: (icon: string) => Promise<void>;
  removeIcon: () => Promise<void>;
}

export type DocumentState = DocumentBlockSlice &
  DocumentCoreSlice &
  DocumentMetaSlice;
