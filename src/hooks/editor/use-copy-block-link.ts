"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { buildBlockAnchorUrl } from "@/lib/block-links";
import { copyTextToClipboard } from "@/lib/clipboard";

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
