import type {
  DocumentBlock,
  DocumentBlockType,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";

import { generateCardId } from "@yaad/core/lib/id";
import { documentService } from "@yaad/core/services/document-service";

import type { DocumentState } from "./types";

const autoSaveTimersMap = new Map<string, ReturnType<typeof setTimeout>>();

export const createBlockDefaults = (
  type: DocumentBlockType,
  options?: { targetPageId?: string },
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (type) {
    case "page":
      return {
        title: [{ text: "Untitled" }],
        icon: "📄",
        ...(options?.targetPageId
          ? { targetPageId: options.targetPageId }
          : {}),
      };

    case "kanban":
      return {
        title: [{ text: "" }],
        columns: [
          { id: "todo", title: "To Do" },
          { id: "in_progress", title: "In Progress" },
          { id: "done", title: "Done" },
        ],
        cards: [
          {
            id: generateCardId(),
            columnId: "todo",
            title: "Welcome to your Kanban board!",
          },
        ],
      };

    case "toggle_list":
      return {
        title: [{ text: "" }],
        isOpen: true,
      };

    default:
      return {
        title: [{ text: "" }],
      };
  }
};

export const createNewBlankDocument = (id: string): DocumentJSON => ({
  version: 1,
  id,
  title: "Untitled",
  rootBlockId: "root",
  blocks: {
    root: {
      id: "root",
      type: "page",
      parentId: null,
      childrenIds: [],
      properties: { title: [{ text: "Untitled" }] },
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  icon: "📄",
});

/**
 * Purely applies property updates to a block and bumps both the block and the
 * document timestamps. Returns the same document reference when the block does
 * not exist, so callers can detect a no-op via reference equality.
 */
export const applyBlockProperties = (
  doc: DocumentJSON,
  blockId: string,
  properties: Record<string, any>,
): DocumentJSON => {
  if (!(blockId in doc.blocks)) {
    return doc;
  }

  const block = doc.blocks[blockId];

  return {
    ...doc,
    blocks: {
      ...doc.blocks,
      [blockId]: {
        ...block,
        properties: {
          ...block.properties,
          ...properties,
        },
        updatedAt: Date.now(),
      },
    },
    updatedAt: Date.now(),
  };
};

/**
 * Purely applies tag updates to a block and bumps both the block and the
 * document timestamps.
 */
export const applyBlockTags = (
  doc: DocumentJSON,
  blockId: string,
  tags: Tag[],
): DocumentJSON => {
  if (!(blockId in doc.blocks)) {
    return doc;
  }

  const block = doc.blocks[blockId];

  return {
    ...doc,
    blocks: {
      ...doc.blocks,
      [blockId]: {
        ...block,
        tags,
        updatedAt: Date.now(),
      },
    },
    updatedAt: Date.now(),
  };
};

/**
 * Recursively collects all block IDs and associated blob IDs for deletion.
 */
export const collectSubTreeForDeletion = (
  startBlockId: string,
  allBlocks: Record<string, DocumentBlock>,
) => {
  const blocksToDelete = new Set<string>();
  const blobsToDelete = new Set<string>();
  const queue = [startBlockId];

  while (queue.length > 0) {
    const blockId = queue.shift();

    if (!blockId || !(blockId in allBlocks) || blocksToDelete.has(blockId)) {
      continue;
    }

    const currentBlock = allBlocks[blockId];
    blocksToDelete.add(blockId);

    const blobId = currentBlock.properties?.blobId;

    if (blobId) {
      blobsToDelete.add(blobId);
    }

    queue.push(...currentBlock.childrenIds);
  }

  return { blocksToDelete, blobsToDelete };
};

/**
 * Helper to update the current document, set state, and trigger a debounced save.
 */
export const updateAndDebounceSave = (
  get: () => DocumentState,
  set: (state: Partial<DocumentState>) => void,
  updater: (doc: DocumentJSON) => DocumentJSON,
): Promise<void> | undefined => {
  const currentDoc = get().currentDocument;
  if (!currentDoc) return;

  const updatedDoc = updater(currentDoc);

  set({ currentDocument: updatedDoc, isSaving: true });

  const existingTimer = autoSaveTimersMap.get(updatedDoc.id);
  if (existingTimer) clearTimeout(existingTimer);

  const timer = setTimeout(() => {
    void (async () => {
      try {
        await documentService.saveDocument(updatedDoc);
      } catch (error) {
        console.error("Failed to auto-save document:", error);
      } finally {
        autoSaveTimersMap.delete(updatedDoc.id);

        if (get().currentDocument === updatedDoc) {
          set({ isSaving: false });
        }
      }
    })();
  }, 500);

  autoSaveTimersMap.set(updatedDoc.id, timer);
};

/**
 * Saves the document immediately, bypassing debounce.
 */
export const saveNow = async (
  _get: () => DocumentState,
  set: (state: Partial<DocumentState>) => void,
  doc: DocumentJSON,
) => {
  const existingTimer = autoSaveTimersMap.get(doc.id);

  if (existingTimer) {
    clearTimeout(existingTimer);
    autoSaveTimersMap.delete(doc.id);
  }

  set({ isSaving: true });
  await documentService.saveDocument(doc);
  set({ isSaving: false });
};
