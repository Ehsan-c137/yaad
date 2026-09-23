"use client";

import { useEffect } from "react";

import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

import { TestEditorStateInspector } from "./__dev__/test-editor-state-inspector";
import { BlockRow } from "./block/block-row";

export function BlockCanvas() {
  const addBlock = useDocumentStore((state) => state.addBlock);

  const childBlockIds = useDocumentStore(
    (state) => state.currentDocument?.blocks?.root?.childrenIds,
  );

  useEffect(() => {
    const handleAddBlock = async () => {
      await addBlock("root", "root", "paragraph");
    };

    // When a document is loaded and it has no blocks, add an initial paragraph block.
    if (childBlockIds && childBlockIds?.length === 0) {
      void handleAddBlock();
    }
  }, [childBlockIds, addBlock]);

  const finalChildBlockIds = childBlockIds ?? [];

  if (!childBlockIds) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-1 px-4 py-6">
      {finalChildBlockIds.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground italic">
            No blocks yet. Click "Add Initial Block" or press Enter in a block.
          </p>
        </div>
      ) : (
        finalChildBlockIds.map((blockId: string) => (
          <BlockRow key={blockId} blockId={blockId} />
        ))
      )}
      {import.meta.env?.DEV && <TestEditorStateInspector />}
    </div>
  );
}
