import type { StateCreator } from "zustand";

import type { DocumentJSON } from "@/types/document";

import { documentService } from "@/services/document-service";

import type { DocumentMetaSlice, DocumentState } from "./types";

import { useSidebarStore } from "../use-sidebar-store";
import { saveNow, updateAndDebounceSave } from "./helpers";

export const createMetaSlice: StateCreator<
  DocumentState,
  [],
  [],
  DocumentMetaSlice
> = (set, get) => ({
  updateTitle: async (newTitleText: string) => {
    await updateAndDebounceSave(get, set, (doc) => {
      useSidebarStore.getState().updatePageTitleInTree(doc.id, newTitleText);
      return {
        ...doc,
        title: newTitleText,
        blocks: {
          ...doc.blocks,
          root: {
            ...doc.blocks.root,
            properties: {
              ...doc.blocks.root.properties,
              title: [{ text: newTitleText }],
            },
            updatedAt: Date.now(),
          },
        },
        updatedAt: Date.now(),
      };
    });
  },

  updateCoverImage: async (coverUrl: string) => {
    const currentDoc = get().currentDocument;
    if (!currentDoc) return;

    const rootBlock = currentDoc.blocks["root"];

    const updatedDoc: DocumentJSON = {
      ...currentDoc,
      coverImage: coverUrl,
      blocks: {
        ...currentDoc.blocks,
        root: {
          ...rootBlock,
          properties: {
            ...rootBlock?.properties,
            coverImage: coverUrl,
          },
          updatedAt: Date.now(),
        },
      },
      updatedAt: Date.now(),
    };

    set({ currentDocument: updatedDoc });
    await saveNow(get, set, updatedDoc);
  },

  removeCoverImage: async () => {
    const currentDoc = get().currentDocument;
    if (!currentDoc) return;

    const rootBlock = currentDoc.blocks["root"];
    const updatedProperties = { ...rootBlock?.properties };
    delete updatedProperties.coverImage;

    const updatedDoc: DocumentJSON = {
      ...currentDoc,
      coverImage: undefined,
      blocks: {
        ...currentDoc.blocks,
        root: {
          ...rootBlock,
          properties: updatedProperties,
          updatedAt: Date.now(),
        },
      },
      updatedAt: Date.now(),
    };

    set({ currentDocument: updatedDoc });
    await documentService.saveDocument(updatedDoc);
  },

  updateIcon: async (icon: string) => {
    const currentDoc = get().currentDocument;
    if (!currentDoc) return;

    const rootBlock = currentDoc.blocks["root"];

    const updatedDoc: DocumentJSON = {
      ...currentDoc,
      icon,
      blocks: {
        ...currentDoc.blocks,
        root: {
          ...rootBlock,
          properties: {
            ...rootBlock?.properties,
            icon,
          },
          updatedAt: Date.now(),
        },
      },
      updatedAt: Date.now(),
    };

    set({ currentDocument: updatedDoc });

    useSidebarStore
      .getState()
      .updatePageTitleInTree?.(currentDoc.id, undefined, icon);

    await documentService.saveDocument(updatedDoc);
  },

  removeIcon: async () => {
    const currentDoc = get().currentDocument;
    if (!currentDoc) return;

    const rootBlock = currentDoc.blocks["root"];
    const updatedProperties = { ...rootBlock?.properties };
    delete updatedProperties.icon;

    const updatedDoc: DocumentJSON = {
      ...currentDoc,
      icon: undefined,
      blocks: {
        ...currentDoc.blocks,
        root: {
          ...rootBlock,
          properties: updatedProperties,
          updatedAt: Date.now(),
        },
      },
      updatedAt: Date.now(),
    };

    set({ currentDocument: updatedDoc });

    useSidebarStore
      .getState()
      .updatePageTitleInTree?.(currentDoc.id, undefined, "📄");

    await documentService.saveDocument(updatedDoc);
  },
});
