/* eslint-disable max-lines-per-function */
import type { StateCreator } from "zustand";

import type { DocumentBlock, DocumentBlockType } from "@/types/document";

import { documentService } from "@/services/document-service";

import type { DocumentBlockSlice, DocumentState } from "./types";

import {
  applyBlockProperties,
  collectSubTreeForDeletion,
  createNewBlankDocument,
  saveNow,
  updateAndDebounceSave,
} from "./helpers";

export const createBlockSlice: StateCreator<
  DocumentState,
  [],
  [],
  DocumentBlockSlice
> = (set, get) => ({
  updateBlockProperties: async (blockId, pageId, properties) => {
    const currentDoc = get().currentDocument;

    // The target page isn't loaded in this store (or is a different page) —
    // delegate to the service, which patches the persisted document directly.
    if (!currentDoc || currentDoc.id !== pageId) {
      await documentService.updateBlockProperties(pageId, blockId, properties);
      return;
    }

    await updateAndDebounceSave(get, set, (doc) =>
      applyBlockProperties(doc, blockId, properties),
    );
  },

  addBlock: async (parentId, afterBlockId, type) => {
    let targetPageId: string | undefined;

    if (type === "page") {
      targetPageId = `page_${crypto.randomUUID()}`;
      const currentDocId = get().currentDocument?.id;

      if (currentDocId) {
        await documentService.createSubPage(currentDocId, "Untitled");
      } else {
        const newChildDoc = createNewBlankDocument(targetPageId);
        await documentService.saveDocument(newChildDoc);
      }
    }

    await updateAndDebounceSave(get, set, (doc) => {
      const newId = `block_${crypto.randomUUID()}`;
      const newBlock: DocumentBlock = {
        id: newId,
        type,
        parentId,
        childrenIds: [],
        properties: {
          title: [{ text: type === "page" ? "Untitled" : "" }],
          ...(targetPageId ? { targetPageId, icon: "📄" } : {}),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedBlocks = { ...doc.blocks, [newId]: newBlock };
      const parentBlock = updatedBlocks[parentId];

      if (parentBlock) {
        const index = parentBlock.childrenIds.indexOf(afterBlockId);
        const newChildren = [...parentBlock.childrenIds];
        newChildren.splice(
          index >= 0 ? index + 1 : newChildren.length,
          0,
          newId,
        );
        updatedBlocks[parentId] = {
          ...parentBlock,
          childrenIds: newChildren,
        };
      }

      return { ...doc, blocks: updatedBlocks, updatedAt: Date.now() };
    });
  },

  deleteBlock: async (blockId: string) => {
    const currentDoc = get().currentDocument;
    if (!currentDoc || blockId === "root") return;

    const blockToDelete = currentDoc.blocks[blockId];
    if (!blockToDelete) return;

    const { blocksToDelete, blobsToDelete } = collectSubTreeForDeletion(
      blockId,
      currentDoc.blocks,
    );

    // Clean up sub-pages associated with any page blocks being deleted
    const pageTargetIdsToDelete: string[] = [];

    for (const id of blocksToDelete) {
      const blk = currentDoc.blocks[id];

      if (blk && blk.type === "page" && blk.properties?.targetPageId) {
        pageTargetIdsToDelete.push(blk.properties.targetPageId);
      }
    }

    // Delegate sub-page deletion to documentService
    await Promise.all(
      pageTargetIdsToDelete.map((targetId) =>
        documentService.deletePageAndSubTree(targetId),
      ),
    );

    const updatedBlocks = Object.fromEntries(
      Object.entries(currentDoc.blocks).filter(
        ([id]) => !blocksToDelete.has(id),
      ),
    );

    // Unlink from parent
    if (blockToDelete.parentId && updatedBlocks[blockToDelete.parentId]) {
      const parent = updatedBlocks[blockToDelete.parentId];
      updatedBlocks[blockToDelete.parentId] = {
        ...parent,
        childrenIds: parent.childrenIds.filter((id) => id !== blockId),
      };
    }

    const updatedDoc = {
      ...currentDoc,
      blocks: updatedBlocks,
      updatedAt: Date.now(),
    };

    set({ currentDocument: updatedDoc });

    // Save document immediately, cancelling any pending debounced saves
    await saveNow(get, set, updatedDoc);

    // Delete associated blobs
    await documentService.deleteBlobs(blobsToDelete);
  },

  changeBlockType: async (blockId: string, newType: DocumentBlockType) => {
    const currentDoc = get().currentDocument;
    if (!currentDoc) return;

    const block = currentDoc.blocks[blockId];
    if (!block || block.type === newType) return;

    let updatedProperties = { ...block.properties };

    if (newType === "page") {
      await handleTransitionToPage(block, currentDoc.id, updatedProperties);
    }
    if (block.type === "page") {
      updatedProperties = await handleTransitionFromPage(
        block,
        updatedProperties,
      );
    }

    const docToUpdate = {
      ...currentDoc,
      blocks: {
        ...currentDoc.blocks,
        [blockId]: {
          ...block,
          type: newType,
          properties: updatedProperties,
          updatedAt: Date.now(),
        },
      },
      updatedAt: Date.now(),
    };

    set({ currentDocument: docToUpdate });
    await saveNow(get, set, docToUpdate);
  },

  addSubPageBlock: async (parentPageId: string) => {
    if (!parentPageId) return null;
    return documentService.createSubPage(parentPageId, "Untitled");
  },

  duplicateBlock: async (blockId: string) => {
    await updateAndDebounceSave(get, set, (doc) => {
      const originalBlock = doc.blocks[blockId];
      if (!originalBlock || blockId === "root") return doc;

      const newBlockId = `block_${crypto.randomUUID()}`;
      const duplicatedBlock: DocumentBlock = {
        ...structuredClone(originalBlock),
        id: newBlockId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedBlocks = { ...doc.blocks, [newBlockId]: duplicatedBlock };
      const parentId = originalBlock.parentId || "root";
      const parentBlock = updatedBlocks[parentId];

      if (parentBlock) {
        const index = parentBlock.childrenIds.indexOf(blockId);
        const newChildren = [...parentBlock.childrenIds];
        newChildren.splice(index + 1, 0, newBlockId);
        updatedBlocks[parentId] = {
          ...parentBlock,
          childrenIds: newChildren,
        };
      }

      return { ...doc, blocks: updatedBlocks, updatedAt: Date.now() };
    });
  },
});

async function handleTransitionToPage(
  block: DocumentBlock,
  currentDocId: string,
  updatedProperties: DocumentBlock["properties"],
) {
  const existingTitle = getBlockTitleText(block);
  const newPageId =
    block.properties.targetPageId ?? `page_${crypto.randomUUID()}`;

  const newChildDoc = createNewBlankDocument(newPageId);
  newChildDoc.title = existingTitle;
  newChildDoc.blocks.root.properties.title = [{ text: existingTitle }];
  await documentService.saveDocument(newChildDoc);

  updatedProperties.targetPageId = newPageId;
  updatedProperties.title = [{ text: existingTitle }];
  updatedProperties.icon = "📄";
}

function getBlockTitleText(block: DocumentBlock): string {
  return block.properties.title?.[0]?.text?.trim() ?? "Untitled";
}

async function handleTransitionFromPage(
  block: DocumentBlock,
  updatedProperties: DocumentBlock["properties"],
): Promise<DocumentBlock["properties"]> {
  if (block.properties.targetPageId) {
    const targetId = block.properties.targetPageId;
    await documentService.deletePageAndSubTree(targetId);
  }

  const { targetPageId: _, icon: __, ...restProperties } = updatedProperties;
  return restProperties;
}
