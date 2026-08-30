import type { DocumentBlock, DocumentJSON } from "@/types/document";

import { storage } from "@/lib/storage/storage-provider";
import {
  applyBlockProperties,
  createNewBlankDocument,
} from "@/store/document/helpers";
import { getDocumentStore } from "@/store/document/use-document-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useTabStore } from "@/store/use-tab-store";

export class DocumentService {
  async loadDocument(id: string): Promise<DocumentJSON> {
    const doc = await storage.getDocument(id);

    if (doc) {
      return doc;
    }

    const newDoc = createNewBlankDocument(id);
    await storage.saveDocument(newDoc);
    return newDoc;
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    await storage.saveDocument(doc);
  }

  async getBlob(id: string): Promise<Blob | undefined> {
    return storage.getBlob(id);
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    await storage.saveBlob(id, blob);
  }

  async deleteBlobs(blobIds: Iterable<string>): Promise<void> {
    await Promise.all(
      Array.from(blobIds).map((blobId) => storage.removeBlob(blobId)),
    );
  }

  async updateBlockProperties(
    pageId: string,
    blockId: string,
    properties: Record<string, any>,
  ): Promise<void> {
    if (!pageId || !blockId) return;

    const docStore = getDocumentStore(pageId);
    const currentDoc = docStore.getState().currentDocument;

    if (currentDoc?.id === pageId) {
      const updatedDoc = applyBlockProperties(currentDoc, blockId, properties);

      // Block not found in the loaded document
      if (updatedDoc === currentDoc) return;

      docStore.setState({ currentDocument: updatedDoc });
      await docStore.getState().saveCurrentDocumentImmediately();
      return;
    }

    const storedDoc = await storage.getDocument(pageId);
    if (!storedDoc) return;

    const updatedDoc = applyBlockProperties(storedDoc, blockId, properties);

    // Block not found in the stored document
    if (updatedDoc === storedDoc) return;

    await this.saveDocument(updatedDoc);
  }

  /**
   * Atomically deletes a page and all its recursive sub-pages from storage,
   * removes associated media blobs, closes open tabs, and updates sidebar state.
   */
  async deletePageAndSubTree(pageId: string): Promise<void> {
    if (!pageId) return;

    const { pages } = useSidebarStore.getState();
    const pagesToDelete = new Set<string>();
    const queue = [pageId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || pagesToDelete.has(currentId)) continue;

      pagesToDelete.add(currentId);
      const sidebarItem = pages[currentId];

      if (sidebarItem?.childrenIds) {
        queue.push(...sidebarItem.childrenIds);
      }
    }

    const pageIdsArray = Array.from(pagesToDelete);

    const blobsToDelete = new Set<string>();

    await Promise.all(
      pageIdsArray.map(async (id) => {
        const doc = await storage.getDocument(id);

        if (doc?.blocks) {
          for (const block of Object.values(doc.blocks)) {
            if (block.properties?.blobId) {
              blobsToDelete.add(block.properties.blobId);
            }
          }
        }

        await storage.deleteDocument(id);
      }),
    );

    await this.deleteBlobs(blobsToDelete);

    pageIdsArray.forEach((id) => {
      useTabStore.getState().removeTabByPageId(id);
    });

    useSidebarStore.getState().deletePage(pageId);

    pageIdsArray.forEach((id) => {
      const docStore = getDocumentStore(id);

      if (docStore.getState().currentDocument?.id === id) {
        docStore.setState({ currentDocument: null });
      }
    });
  }

  /**
   * Creates a new sub-page document and links it to the parent page.
   */
  async createSubPage(
    parentPageId: string,
    title = "Untitled",
  ): Promise<string> {
    const newPageId = `page_${crypto.randomUUID()}`;

    // 1. Save new blank document to storage
    const newChildDoc = createNewBlankDocument(newPageId);
    newChildDoc.title = title;
    newChildDoc.blocks.root.properties.title = [{ text: title }];
    await this.saveDocument(newChildDoc);

    // 2. Register sub-page in sidebar tree UI
    useSidebarStore
      .getState()
      .registerSubPageInTree(newPageId, parentPageId, title, "📄");

    // 3. Append page block to parent document
    const newBlockId = `block_${crypto.randomUUID()}`;
    const pageBlock: DocumentBlock = {
      id: newBlockId,
      type: "page",
      parentId: "root",
      childrenIds: [],
      properties: {
        title: [{ text: title }],
        targetPageId: newPageId,
        icon: "📄",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const parentDocStore = getDocumentStore(parentPageId);
    const parentDoc = parentDocStore.getState().currentDocument;

    if (parentDoc) {
      const rootBlock = parentDoc.blocks.root;
      const updatedRoot = {
        ...rootBlock,
        childrenIds: [...(rootBlock?.childrenIds || []), newBlockId],
      };

      parentDocStore.setState({
        currentDocument: {
          ...parentDoc,
          blocks: {
            ...parentDoc.blocks,
            [newBlockId]: pageBlock,
            root: updatedRoot,
          },
          updatedAt: Date.now(),
        },
      });

      await parentDocStore.getState().saveCurrentDocumentImmediately();
    } else {
      const storedParentDoc = await storage.getDocument(parentPageId);

      if (storedParentDoc) {
        const rootBlock = storedParentDoc.blocks.root || {
          id: "root",
          type: "page",
          parentId: null,
          childrenIds: [],
          properties: {
            title: [{ text: storedParentDoc.title || "Untitled" }],
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const updatedParentDoc: DocumentJSON = {
          ...storedParentDoc,
          blocks: {
            ...storedParentDoc.blocks,
            [newBlockId]: pageBlock,
            root: {
              ...rootBlock,
              childrenIds: [...(rootBlock.childrenIds || []), newBlockId],
            },
          },
          updatedAt: Date.now(),
        };
        await this.saveDocument(updatedParentDoc);
      }
    }

    return newPageId;
  }
}

export const documentService = new DocumentService();
