import type { SyncStatus } from "@yaad/core/lib/sync/types";

import { syncWorker } from "@yaad/core/lib/storage/storage-provider";
import { outboxQueue } from "@yaad/core/lib/sync/outbox-queue";
import { useEffect, useState } from "react";

import { useCollabContext } from "@/context/use-collab";

export type SaveState = "error" | "offline" | "saved" | "syncing";

export interface SyncStatusState {
  saveState: SaveState;
  pendingCount: number;
  syncWorkerStatus: SyncStatus;
  collabStatus: "connected" | "connecting" | "disconnected";
  triggerSync: () => void;
}

export function useSyncStatus(): SyncStatusState {
  const { status: collabStatus } = useCollabContext();
  const [syncWorkerStatus, setSyncWorkerStatus] = useState<SyncStatus>(
    syncWorker.getStatus(),
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = syncWorker.subscribeStatus((newStatus) => {
      setSyncWorkerStatus(newStatus);
    });

    let isMounted = true;

    const checkQueue = async () => {
      try {
        const count = await outboxQueue.size();

        if (isMounted) {
          setPendingCount(count);
        }
      } catch {
        // Storage check fallback
      }
    };

    void checkQueue();
    const interval = setInterval(() => {
      void checkQueue();
    }, 4000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const triggerSync = () => {
    void syncWorker.syncNow();
  };

  let saveState: SaveState;

  if (syncWorkerStatus === "syncing" || collabStatus === "connecting") {
    saveState = "syncing";
  } else if (syncWorkerStatus === "error") {
    saveState = "error";
  } else if (
    syncWorkerStatus === "offline" ||
    collabStatus === "disconnected"
  ) {
    saveState = "offline";
  } else if (pendingCount > 0) {
    saveState = "syncing";
  } else {
    saveState = "saved";
  }

  return {
    saveState,
    pendingCount,
    syncWorkerStatus,
    collabStatus,
    triggerSync,
  };
}
