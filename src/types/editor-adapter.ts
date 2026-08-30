import type { DocumentBlock, DocumentBlockType } from "@/types/document";

export interface EditorAdapter {
  documentId: string;

  getBlock: (blockId: string) => DocumentBlock | undefined;

  updateBlockProperties: (
    blockId: string,
    pageId: string,
    properties: Record<string, any>,
  ) => Promise<void> | void;

  changeBlockType: (
    blockId: string,
    type: DocumentBlockType,
  ) => Promise<void> | void;

  duplicateBlock: (blockId: string) => Promise<void> | void;

  deleteBlock: (blockId: string) => Promise<void> | void;

  addBlock: (
    parentId: string,
    afterBlockId: string,
    type: DocumentBlockType,
  ) => Promise<void> | void;
}
