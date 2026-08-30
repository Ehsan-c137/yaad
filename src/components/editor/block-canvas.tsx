"use client";

import { useEffect } from "react";

import { useDocumentStore } from "@/store/document/use-document-store";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-6">
      {finalChildBlockIds.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground italic">
            No blocks yet. Click "Add Initial Block" or press Enter in a block.
          </p>
        </div>
      ) : (
        finalChildBlockIds.map((blockId) => (
          <BlockRow key={blockId} blockId={blockId} />
        ))
      )}
      {process.env.NODE_ENV === "development" && <TestEditorStateInspector />}
    </div>
  );
}

function TestEditorStateInspector() {
  const currentDocument = useDocumentStore((state) => state.currentDocument);

  if (!currentDocument) {
    return null;
  }

  return (
    <details className="mx-auto mt-12 w-full max-w-3xl rounded-lg bg-muted p-4 font-mono text-xs">
      <summary className="mb-2 cursor-pointer font-semibold text-muted-foreground select-none">
        Inspect Current JSON State ({Object.keys(currentDocument.blocks).length}{" "}
        blocks)
      </summary>
      <pre className="overflow-x-auto text-neutral-700 dark:text-neutral-300">
        {JSON.stringify(currentDocument, null, 2)}
      </pre>
    </details>
  );
}
