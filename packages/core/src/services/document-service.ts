/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { TagIndexRecord } from "@yaad/core/lib/storage/types";
import type { MoveBlockOptions } from "@yaad/core/store/document/helpers";
import type {
  DocumentBlock,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";

import { generateBlockId, generatePageId } from "@yaad/core/lib/id";
import { storage } from "@yaad/core/lib/storage/storage-provider";
import {
  applyBlockProperties,
  applyBlockTags,
  createNewBlankDocument,
  moveBlockInDoc,
} from "@yaad/core/store/document/helpers";
import {
  getExistingDocumentStore,
  removeDocumentStore,
} from "@yaad/core/store/document/use-document-store";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";

export interface AttachSubPageBlockOptions {
  icon?: string;
  position?: "after" | "before" | "inside";
  targetBlockId?: string;
  targetSiblingPageId?: string;
  title?: string;
}

export function extractDocTagRecords(doc: DocumentJSON): TagIndexRecord[] {
  const records: TagIndexRecord[] = [];
  if (!doc?.blocks) return records;

  for (const block of Object.values(doc.blocks)) {
    if (block.tags && block.tags.length > 0) {
      let snippet = "";

      if (block.properties?.title && Array.isArray(block.properties.title)) {
        snippet = block.properties.title
          .map((segment: any) => segment.text ?? "")
          .join("");
      } else if (typeof block.properties?.code === "string") {
        snippet = block.properties.code;
      } else if (typeof block.properties?.caption === "string") {
        snippet = block.properties.caption;
      }

      for (const tag of block.tags) {
        records.push({
          blockId: block.id,
          blockType: block.type,
          pageId: doc.id,
          snippet: snippet.slice(0, 150),
          tagId: tag.id,
          updatedAt: doc.updatedAt || Date.now(),
        });
      }
    }
  }

  return records;
}

export function findPageBlockByTargetId(
  blocks: Record<string, DocumentBlock>,
  targetPageId: string,
): string | null {
  for (const [id, blk] of Object.entries(blocks)) {
    if (blk.type === "page" && blk.properties?.targetPageId === targetPageId) {
      return id;
    }
  }

  return null;
}

function collectSubtreePageIds(
  rootPageId: string,
  pages: Record<string, any>,
): string[] {
  const pagesToDelete = new Set<string>();
  const queue = [rootPageId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || pagesToDelete.has(currentId)) continue;

    pagesToDelete.add(currentId);
    const sidebarItem = pages[currentId];

    if (sidebarItem?.childrenIds) {
      queue.push(...sidebarItem.childrenIds);
    }
  }

  return Array.from(pagesToDelete);
}

export class DocumentService {
  async loadDocument(id: string): Promise<DocumentJSON> {
    const doc = await storage.getDocument(id);

    if (doc) {
      return doc;
    }

    const newDoc = createNewBlankDocument(id);
    await this.saveDocument(newDoc);
    return newDoc;
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    await storage.saveDocument(doc);

    if (storage.saveDocTags) {
      const records = extractDocTagRecords(doc);
      await storage.saveDocTags(doc.id, records);
    }
  }

  async getBlob(id: string): Promise<Blob | undefined> {
    return storage.getBlob(id);
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    await storage.saveBlob(id, blob);
  }

  async deleteBlobs(blobIds: Iterable<string>): Promise<void> {
    const uniqueIds = Array.from(new Set(blobIds)).filter(Boolean);

    await Promise.all(uniqueIds.map((blobId) => storage.removeBlob(blobId)));
  }

  /**
   * Applies an updater to a document whether it is currently loaded in memory
   * or persisted in storage, updating the active store or storage adapter accordingly.
   */
  async mutateDocument(
    pageId: string,
    updater: (doc: DocumentJSON) => DocumentJSON | null | undefined,
    options?: { createIfMissing?: boolean },
  ): Promise<DocumentJSON | null> {
    if (!pageId) return null;

    const docStore = getExistingDocumentStore(pageId);
    const inMemoryDoc = docStore?.getState().currentDocument;

    if (docStore && inMemoryDoc?.id === pageId) {
      const updatedDoc = updater(inMemoryDoc);

      if (!updatedDoc || updatedDoc === inMemoryDoc) {
        return inMemoryDoc;
      }

      docStore.setState({ currentDocument: updatedDoc });
      await docStore.getState().saveCurrentDocumentImmediately();
      return updatedDoc;
    }

    const storedDoc =
      (await storage.getDocument(pageId)) ??
      (options?.createIfMissing ? createNewBlankDocument(pageId) : null);

    if (!storedDoc) return null;

    const updatedDoc = updater(storedDoc);

    if (!updatedDoc || updatedDoc === storedDoc) {
      return storedDoc;
    }

    await this.saveDocument(updatedDoc);
    return updatedDoc;
  }

  async updateBlockProperties(
    pageId: string,
    blockId: string,
    properties: Record<string, any>,
  ): Promise<void> {
    if (!pageId || !blockId) return;

    await this.mutateDocument(pageId, (doc) => {
      const updated = applyBlockProperties(doc, blockId, properties);
      return updated === doc ? null : updated;
    });
  }

  async updateBlockTags(
    pageId: string,
    blockId: string,
    tags: Tag[],
  ): Promise<void> {
    if (!pageId || !blockId) return;

    await this.mutateDocument(pageId, (doc) => {
      const updated = applyBlockTags(doc, blockId, tags);
      return updated === doc ? null : updated;
    });
  }

  async moveBlock(pageId: string, options: MoveBlockOptions): Promise<void> {
    const { sourceBlockId, targetBlockId } = options;

    if (!pageId || !sourceBlockId || !targetBlockId) return;

    await this.mutateDocument(pageId, (doc) => {
      const updated = moveBlockInDoc(doc, options);

      return updated === doc ? null : updated;
    });
  }

  /**
   * Atomically deletes a page and all its recursive sub-pages from storage,
   * removes associated media blobs, closes open tabs, and cleans up document stores.
   */
  async deletePageAndSubTree(pageId: string): Promise<void> {
    if (!pageId) return;

    const { pages } = useSidebarStore.getState();
    const parentId = pages[pageId]?.parentId;

    if (parentId) {
      await this.removeSubPageBlock(parentId, pageId);
    }

    const pageIdsArray = collectSubtreePageIds(pageId, pages);
    const blobsToDelete = await this.collectBlobsForDeletion(pageIdsArray);

    await Promise.all(pageIdsArray.map((id) => storage.deleteDocument(id)));
    await this.deleteBlobs(blobsToDelete);

    pageIdsArray.forEach((id) => {
      useTabStore.getState().removeTabByPageId(id);
    });

    pageIdsArray.forEach((id) => {
      const docStore = getExistingDocumentStore(id);

      if (docStore) {
        docStore.setState({ currentDocument: null });
        removeDocumentStore(id, false);
      }
    });
  }

  private async collectBlobsForDeletion(
    pageIds: string[],
  ): Promise<Set<string>> {
    const blobsToDelete = new Set<string>();

    await Promise.all(
      pageIds.map(async (id) => {
        const inMemoryDoc =
          getExistingDocumentStore(id)?.getState().currentDocument;
        const doc =
          (inMemoryDoc?.id === id ? inMemoryDoc : null) ??
          (await storage.getDocument(id));

        if (doc?.coverImage?.startsWith("blob_")) {
          blobsToDelete.add(doc.coverImage);
        }

        if (doc?.blocks) {
          for (const block of Object.values(doc.blocks)) {
            if (block.properties?.blobId) {
              blobsToDelete.add(block.properties.blobId);
            }
          }
        }
      }),
    );

    return blobsToDelete;
  }

  /**
   * Attaches or reorders a sub-page block inside parentPageId.
   */
  async attachSubPageBlock(
    parentPageId: string,
    subPageId: string,
    options?: AttachSubPageBlockOptions,
  ): Promise<string | null> {
    if (!parentPageId || !subPageId || parentPageId === subPageId) return null;

    let attachedBlockId: string | null = null;

    await this.mutateDocument(
      parentPageId,
      (doc) => {
        const rootBlock: DocumentBlock = doc.blocks?.root ?? {
          childrenIds: [],
          createdAt: Date.now(),
          id: "root",
          parentId: null,
          properties: {
            title: [{ text: doc.title || "Untitled" }],
          },
          tags: [],
          type: "page",
          updatedAt: Date.now(),
        };

        const blocks: Record<string, DocumentBlock> = {
          ...(doc.blocks ?? {}),
          root: rootBlock,
        };

        const existingBlockId = findPageBlockByTargetId(blocks, subPageId);
        const existingBlock = existingBlockId ? blocks[existingBlockId] : null;
        const sidebarPage = useSidebarStore.getState().pages[subPageId];

        const title =
          options?.title ??
          sidebarPage?.title ??
          existingBlock?.properties?.title?.[0]?.text ??
          "Untitled";
        const icon =
          options?.icon ??
          sidebarPage?.icon ??
          existingBlock?.properties?.icon ??
          "📄";

        let blockIdToPosition: string;

        if (existingBlockId) {
          blockIdToPosition = existingBlockId;
          blocks[existingBlockId] = {
            ...blocks[existingBlockId],
            properties: {
              ...blocks[existingBlockId].properties,
              icon,
              targetPageId: subPageId,
              title: [{ text: title }],
            },
            updatedAt: Date.now(),
          };
        } else {
          const newBlockId = generateBlockId();
          blockIdToPosition = newBlockId;
          blocks[newBlockId] = {
            childrenIds: [],
            createdAt: Date.now(),
            id: newBlockId,
            parentId: "root",
            properties: {
              icon,
              targetPageId: subPageId,
              title: [{ text: title }],
            },
            tags: [],
            type: "page",
            updatedAt: Date.now(),
          };
        }

        attachedBlockId = blockIdToPosition;

        const currentChildren = (rootBlock.childrenIds || []).filter(
          (id) => id !== blockIdToPosition,
        );

        let targetIdx = -1;

        if (options?.targetBlockId) {
          targetIdx = currentChildren.indexOf(options.targetBlockId);
        }

        if (targetIdx === -1 && options?.targetSiblingPageId) {
          const siblingBlockId = findPageBlockByTargetId(
            blocks,
            options.targetSiblingPageId,
          );

          if (siblingBlockId) {
            targetIdx = currentChildren.indexOf(siblingBlockId);
          }
        }

        if (options?.position !== "inside" && targetIdx !== -1) {
          if (options?.position === "before") {
            currentChildren.splice(targetIdx, 0, blockIdToPosition);
          } else {
            currentChildren.splice(targetIdx + 1, 0, blockIdToPosition);
          }
        } else {
          currentChildren.push(blockIdToPosition);
        }

        blocks.root = {
          ...rootBlock,
          childrenIds: currentChildren,
          updatedAt: Date.now(),
        };

        return {
          ...doc,
          blocks,
          updatedAt: Date.now(),
        };
      },
      { createIfMissing: true },
    );

    return attachedBlockId;
  }

  /**
   * Removes any sub-page block referencing subPageId from parentPageId.
   */
  async removeSubPageBlock(
    parentPageId: string,
    subPageId: string,
  ): Promise<void> {
    if (!parentPageId || !subPageId) return;

    await this.mutateDocument(parentPageId, (doc) => {
      if (!doc.blocks) return null;

      const blockIdToRemove = findPageBlockByTargetId(doc.blocks, subPageId);
      if (!blockIdToRemove) return null;

      const parentBlockId = doc.blocks[blockIdToRemove]?.parentId ?? "root";
      const { [blockIdToRemove]: _, ...remainingBlocks } = doc.blocks;

      if (parentBlockId in remainingBlocks) {
        const pBlock = remainingBlocks[parentBlockId];
        remainingBlocks[parentBlockId] = {
          ...pBlock,
          childrenIds: (pBlock.childrenIds || []).filter(
            (id) => id !== blockIdToRemove,
          ),
          updatedAt: Date.now(),
        };
      } else if (remainingBlocks.root) {
        remainingBlocks.root = {
          ...remainingBlocks.root,
          childrenIds: (remainingBlocks.root.childrenIds || []).filter(
            (id) => id !== blockIdToRemove,
          ),
          updatedAt: Date.now(),
        };
      }

      return {
        ...doc,
        blocks: remainingBlocks,
        updatedAt: Date.now(),
      };
    });
  }

  /**
   * Synchronizes sub-page blocks when a page is relocated in the page tree.
   */
  /* eslint-disable-next-line max-params */
  async moveSubPageBlock(
    sourcePageId: string,
    oldParentId: string | null,
    newParentId: string | null,
    options?: AttachSubPageBlockOptions,
  ): Promise<void> {
    if (!sourcePageId) return;

    if (oldParentId && oldParentId !== newParentId) {
      await this.removeSubPageBlock(oldParentId, sourcePageId);
    }

    if (newParentId) {
      await this.attachSubPageBlock(newParentId, sourcePageId, options);
    }
  }

  /**
   * Creates a new sub-page document and links it to the parent page.
   */
  async createSubPage(
    parentPageId: string,
    title = "Untitled",
  ): Promise<string> {
    const newPageId = generatePageId();

    // 1. Save new blank document to storage
    const newChildDoc = createNewBlankDocument(newPageId);
    newChildDoc.title = title;

    if (newChildDoc.blocks.root) {
      newChildDoc.blocks.root.properties = {
        ...newChildDoc.blocks.root.properties,
        title: [{ text: title }],
      };
    }

    await this.saveDocument(newChildDoc);

    // 2. Register sub-page in sidebar tree UI
    useSidebarStore
      .getState()
      .registerSubPageInTree(newPageId, parentPageId, title, "📄");

    // 3. Append page block to parent document
    await this.attachSubPageBlock(parentPageId, newPageId, {
      icon: "📄",
      position: "inside",
      title,
    });

    return newPageId;
  }
}

export const documentService = new DocumentService();
