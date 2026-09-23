import type { DocumentBlock } from "@yaad/core/types/document";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { getDocumentStore } from "@yaad/core/store/document/use-document-store";
import { useCallback, useRef, useState } from "react";

interface BlockPreviewState {
  block: DocumentBlock | null;
  isLoading: boolean;
}

// Module-level cache so multiple hook instances share fetched documents
const documentCache = new Map<string, Record<string, DocumentBlock>>();

function getPreviewBlock(
  blocks: Record<string, DocumentBlock>,
  blockId?: string,
): DocumentBlock | null {
  if (blockId) {
    return blocks[blockId];
  }

  const values = Object.values(blocks);
  if (values.length === 0) return null;
  // Find first non-page content block
  const contentBlock = values.find(
    (b) =>
      b.type !== "page" &&
      Boolean(b.properties.title ?? b.properties.code ?? b.properties.caption),
  );
  const preview =
    (contentBlock || values.find((b) => b.type !== "page")) ??
    values[0] ??
    null;

  return preview;
}

export function useBlockPreview() {
  const [state, setState] = useState<BlockPreviewState>({
    block: null,
    isLoading: false,
  });

  const abortRef = useRef(0);

  const fetchBlock = useCallback(
    async (pageId: string | undefined, blockId: string | undefined) => {
      if (!pageId) {
        setState({ block: null, isLoading: false });
        return;
      }

      // Check cache first
      const cached = documentCache.get(pageId);

      if (cached) {
        const block = getPreviewBlock(cached, blockId);
        setState({ block, isLoading: false });
        return;
      }

      // Check active Zustand store for the document if it's currently loaded
      try {
        const activeDoc = getDocumentStore(pageId).getState().currentDocument;

        if (activeDoc?.blocks) {
          documentCache.set(pageId, activeDoc.blocks);
          const block = getPreviewBlock(activeDoc.blocks, blockId);
          setState({ block, isLoading: false });
          return;
        }
      } catch {
        // Ignore store lookup errors and fallback to storage
      }

      const requestId = abortRef.current + 1;
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const doc = await storage.getDocument(pageId);

        // Stale request guard
        if (requestId !== abortRef.current) return;

        if (doc?.blocks) {
          documentCache.set(pageId, doc.blocks);
          const block = getPreviewBlock(doc.blocks, blockId);
          setState({ block, isLoading: false });
        } else {
          setState({ block: null, isLoading: false });
        }
      } catch {
        if (requestId === abortRef.current) {
          setState({ block: null, isLoading: false });
        }
      }
    },
    [],
  );

  const clear = useCallback(() => {
    abortRef.current = abortRef.current + 1;
    setState({ block: null, isLoading: false });
  }, []);

  return { ...state, fetchBlock, clear };
}
