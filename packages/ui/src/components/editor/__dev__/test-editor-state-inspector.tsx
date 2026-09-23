"use client";

import { useDocumentStore } from "@/hooks/editor/use-document-store-ui";

export function TestEditorStateInspector() {
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
