import type { DocumentState } from "@yaad/core/store/document/use-document-store";

import { useDocumentStoreCore } from "@yaad/core/store/document/use-document-store";

import { useEditorPageIdContext } from "../../context/use-editor-context";

export function useDocumentStore<T>(
  selector: (state: DocumentState) => T,
  explicitPageId?: string,
): T {
  const contextPageId = useEditorPageIdContext();
  const pageId = explicitPageId || contextPageId;

  if (!pageId) {
    throw new Error(
      "useDocumentStore requires a pageId from EditorPageIdProvider context or explicitly passed as the second argument.",
    );
  }

  return useDocumentStoreCore(selector, pageId);
}
