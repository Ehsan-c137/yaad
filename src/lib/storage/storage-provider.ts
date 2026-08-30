import type { StorageAdapter } from "./types";

import { storage as factoryStorage } from "./storage-factory";

export const storage: StorageAdapter = factoryStorage;
