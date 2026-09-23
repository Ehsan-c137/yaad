"use client";

import { buildBlockAnchorUrl } from "@yaad/core/lib/block-links";
import { copyTextToClipboard } from "@yaad/core/lib/clipboard";
import { useCallback } from "react";
import { toast } from "sonner";

export function useCopyBlockLink(blockId: string) {
  return useCallback(() => {
    void (async () => {
      try {
        await copyTextToClipboard(buildBlockAnchorUrl(blockId));
        toast.success("Block link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    })();
  }, [blockId]);
}
