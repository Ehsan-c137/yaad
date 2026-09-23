import type { Tag } from "@yaad/core/types/document";
import type { StateStorage } from "zustand/middleware";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const memoryFallback = new Map<string, string>();

const isPersistenceAvailable = () => {
  if (typeof window !== "undefined") {
    return (
      "__TAURI_INTERNALS__" in window ||
      "__TAURI__" in window ||
      typeof indexedDB !== "undefined"
    );
  }

  return false;
};

const adapterStorage: StateStorage = {
  getItem: async (name) => {
    try {
      if (isPersistenceAvailable() && storage.getTags) {
        const tags = await storage.getTags();

        if (tags && tags.length > 0) {
          return JSON.stringify({ state: { tags }, version: 0 });
        }
      }

      return memoryFallback.get(name) ?? null;
    } catch {
      return memoryFallback.get(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    memoryFallback.set(name, value);

    try {
      if (isPersistenceAvailable() && storage.saveTags) {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed?.state?.tags)) {
          await storage.saveTags(parsed.state.tags);
        }
      }
    } catch (e) {
      console.error("[useTagStore] Error saving tags to storage adapter:", e);
    }
  },
  removeItem: async (name) => {
    memoryFallback.delete(name);

    try {
      if (isPersistenceAvailable() && storage.saveTags) {
        await storage.saveTags([]);
      }
    } catch (e) {
      console.error(
        "[useTagStore] Error removing tags from storage adapter:",
        e,
      );
    }
  },
};

export interface TagState {
  tags: Tag[];
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  addTag: (tag: Tag) => void;
  addTags: (tags: Tag[]) => void;
  updateTag: (tagId: string, updates: Partial<Omit<Tag, "id">>) => void;
  removeTag: (tagId: string) => void;
  deleteTag: (tagId: string) => void;
  setTags: (tags: Tag[]) => void;
  clearTags: () => void;
  getTag: (tagId: string) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
}

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addTag: (tag) =>
        set((state) =>
          state.tags.some((existingTag) => existingTag.id === tag.id)
            ? state
            : { tags: [...state.tags, tag] },
        ),

      addTags: (tags) =>
        set((state) => {
          const knownIds = new Set(state.tags.map((tag) => tag.id));
          const newTags = tags.filter((tag) => !knownIds.has(tag.id));
          return newTags.length > 0
            ? { tags: [...state.tags, ...newTags] }
            : state;
        }),

      updateTag: (tagId, updates) =>
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, ...updates } : tag,
          ),
        })),

      /** @deprecated Use deleteTag instead */
      removeTag: (tagId) => get().deleteTag(tagId),

      deleteTag: (tagId) =>
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== tagId),
        })),

      setTags: (tags) => set({ tags }),

      clearTags: () => set({ tags: [] }),

      getTag: (tagId) => get().tags.find((tag) => tag.id === tagId),

      getTagByName: (name) =>
        get().tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase()),
    }),
    {
      storage: createJSONStorage(() => adapterStorage),
      name: "tags-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
