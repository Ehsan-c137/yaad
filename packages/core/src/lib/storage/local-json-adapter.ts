import type {
  CalendarCategory,
  CalendarEvent,
} from "@yaad/core/store/calendar/types";
import type { DocumentJSON, Tag } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import { del, get, keys, set } from "idb-keyval";

import type { StorageAdapter, TagIndexRecord } from "./types";

import { blobStorage } from "./blob-storage";

const WORKSPACES_KEY = "app_workspaces_v1";
const TAG_INDEX_KEY = "app_tag_index_v1";
const TAGS_KEY = "app_tags_v1";
const CALENDAR_EVENTS_KEY = "app_calendar_events_v1";
const CALENDAR_CATEGORIES_KEY = "app_calendar_categories_v1";

export class LocalJsonAdapter implements StorageAdapter {
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      return await this.readWorkspaces();
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      const workspaces = await this.readWorkspaces();
      const index = workspaces.findIndex((w) => w.id === workspace.id);

      if (index >= 0) {
        workspaces[index] = workspace;
      } else {
        workspaces.push(workspace);
      }

      await set(WORKSPACES_KEY, workspaces);
    } catch (error) {
      console.error("[LocalJsonAdapter] Error saving workspace:", error);
    }
  }

  private async readWorkspaces(): Promise<Workspace[]> {
    const stored = await get<unknown>(WORKSPACES_KEY);

    if (stored === undefined) return [];
    if (!Array.isArray(stored)) {
      throw new TypeError("Stored workspaces must be an array");
    }

    return stored as Workspace[];
  }

  async deleteWorkspace(id: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    const updated = workspaces.filter((w) => w.id !== id);
    await set(WORKSPACES_KEY, updated);

    // Clean up pages and tag index records belonging to this workspace tree
    const tree = await this.getWorkspaceTree(id);

    await Promise.all(
      tree.map(async (page) => {
        await del(`doc_${page.id}`);
        await this.deleteDocTags(page.id);
      }),
    );

    await del(`tree_${id}`);
  }

  // WORKSPACE TREE
  async getWorkspaceTree(workspaceId: string): Promise<WorkspacePageMeta[]> {
    try {
      const tree = await get<WorkspacePageMeta[]>(`tree_${workspaceId}`);
      return tree ?? [];
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error loading tree for workspace ${workspaceId}:`,
        error,
      );
      return [];
    }
  }

  async saveWorkspaceTree(
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ): Promise<void> {
    await set(`tree_${workspaceId}`, tree);
  }

  // DOCUMENT
  async getDocument(id: string): Promise<DocumentJSON | null> {
    try {
      const doc = await get<DocumentJSON>(`doc_${id}`);
      return doc ?? null;
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error loading document ${id}:`, error);
      return null;
    }
  }

  async saveDocument(doc: DocumentJSON): Promise<void> {
    await set(`doc_${doc.id}`, doc);
  }

  async deleteDocument(id: string): Promise<void> {
    await del(`doc_${id}`);
    await this.deleteDocTags(id);
  }

  async getAllDocuments(): Promise<DocumentJSON[]> {
    try {
      const allKeys = await keys();
      const docKeys = allKeys.filter(
        (k): k is string => typeof k === "string" && k.startsWith("doc_"),
      );
      const docs: DocumentJSON[] = [];
      const CHUNK_SIZE = 25;

      for (let i = 0; i < docKeys.length; i += CHUNK_SIZE) {
        const chunk = docKeys.slice(i, i + CHUNK_SIZE);
        const chunkDocs = await Promise.all(
          chunk.map((k) => get<DocumentJSON>(k)),
        );

        for (const doc of chunkDocs) {
          if (doc) docs.push(doc);
        }
      }

      return docs;
    } catch (error) {
      console.error("[LocalJsonAdapter] Error fetching all documents:", error);
      return [];
    }
  }

  // TAG OPERATIONS
  async getTags(): Promise<Tag[]> {
    try {
      const tags = await get<Tag[]>(TAGS_KEY);
      return tags ?? [];
    } catch (error) {
      console.error("[LocalJsonAdapter] Error fetching tags:", error);
      return [];
    }
  }

  async saveTags(tags: Tag[]): Promise<void> {
    await set(TAGS_KEY, tags);
  }

  // TAG INDEX
  async saveDocTags(pageId: string, records: TagIndexRecord[]): Promise<void> {
    const indexMap =
      (await get<Record<string, TagIndexRecord[]>>(TAG_INDEX_KEY)) ?? {};

    if (!records || records.length === 0) {
      Reflect.deleteProperty(indexMap, pageId);
    } else {
      indexMap[pageId] = records;
    }

    await set(TAG_INDEX_KEY, indexMap);
  }

  async deleteDocTags(pageId: string): Promise<void> {
    const indexMap =
      (await get<Record<string, TagIndexRecord[]>>(TAG_INDEX_KEY)) || {};

    if (Reflect.has(indexMap, pageId)) {
      Reflect.deleteProperty(indexMap, pageId);
      await set(TAG_INDEX_KEY, indexMap);
    }
  }

  async getTagsIndex(tagId?: string): Promise<TagIndexRecord[]> {
    try {
      const indexMap =
        (await get<Record<string, TagIndexRecord[]>>(TAG_INDEX_KEY)) ?? {};
      const allRecords = Object.values(indexMap).flat();

      if (tagId) {
        return allRecords.filter((r) => r.tagId === tagId);
      }

      return allRecords;
    } catch (error) {
      console.error("[LocalJsonAdapter] Error fetching tag index:", error);
      return [];
    }
  }

  // BLOB
  async getBlob(id: string): Promise<Blob | undefined> {
    try {
      return await blobStorage.get(id);
    } catch (error) {
      console.error(`[LocalJsonAdapter] Error loading blob ${id}:`, error);
      return undefined;
    }
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    await blobStorage.save(id, blob);
  }

  async removeBlob(id: string): Promise<void> {
    await blobStorage.remove(id);
  }

  async getAllBlobs(): Promise<{ id: string; blob: Blob }[]> {
    try {
      const allKeys = await keys();
      const blobKeys = allKeys.filter(
        (k): k is string => typeof k === "string" && k.startsWith("blob_"),
      );
      const results: { id: string; blob: Blob }[] = [];
      const CHUNK_SIZE = 10;

      for (let i = 0; i < blobKeys.length; i += CHUNK_SIZE) {
        const chunk = blobKeys.slice(i, i + CHUNK_SIZE);
        const chunkBlobs = await Promise.all(
          chunk.map(async (key) => {
            const id = key.replace("blob_", "");
            const blob = await blobStorage.get(id);
            return blob ? { id, blob } : null;
          }),
        );

        for (const item of chunkBlobs) {
          if (item) results.push(item);
        }
      }

      return results;
    } catch (error) {
      console.error("[LocalJsonAdapter] Error fetching all blobs:", error);
      return [];
    }
  }

  // CALENDAR OPERATIONS
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const events = await get<CalendarEvent[]>(CALENDAR_EVENTS_KEY);
      return events ?? [];
    } catch (error) {
      console.error(
        "[LocalJsonAdapter] Error fetching calendar events:",
        error,
      );
      return [];
    }
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      const index = events.findIndex((e) => e.id === event.id);

      if (index >= 0) {
        events[index] = event;
      } else {
        events.push(event);
      }

      await set(CALENDAR_EVENTS_KEY, events);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error saving calendar event ${event.id}:`,
        error,
      );
    }
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      const updated = events.filter((e) => e.id !== id);
      await set(CALENDAR_EVENTS_KEY, updated);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error deleting calendar event ${id}:`,
        error,
      );
    }
  }

  async getCalendarCategories(): Promise<CalendarCategory[]> {
    try {
      const categories = await get<CalendarCategory[]>(CALENDAR_CATEGORIES_KEY);
      return categories ?? [];
    } catch (error) {
      console.error(
        "[LocalJsonAdapter] Error fetching calendar categories:",
        error,
      );
      return [];
    }
  }

  async saveCalendarCategory(category: CalendarCategory): Promise<void> {
    try {
      const categories = await this.getCalendarCategories();
      const index = categories.findIndex((c) => c.id === category.id);

      if (index >= 0) {
        categories[index] = category;
      } else {
        categories.push(category);
      }

      await set(CALENDAR_CATEGORIES_KEY, categories);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error saving calendar category ${category.id}:`,
        error,
      );
    }
  }

  async deleteCalendarCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCalendarCategories();
      const updated = categories.filter((c) => c.id !== id);
      await set(CALENDAR_CATEGORIES_KEY, updated);
    } catch (error) {
      console.error(
        `[LocalJsonAdapter] Error deleting calendar category ${id}:`,
        error,
      );
    }
  }
}
