import { del, get, set } from "idb-keyval";

export const blobStorage = {
  async save(id: string, blob: Blob): Promise<void> {
    await set(`blob_${id}`, blob);
  },
  async get(id: string): Promise<Blob | undefined> {
    return get(`blob_${id}`);
  },
  async remove(id: string): Promise<void> {
    await del(`blob_${id}`);
  },
};
