"use client";

import { createContext, use } from "react";

export const DocumentPageIdContext = createContext<string>("");
DocumentPageIdContext.displayName = "DocumentPageIdContext";

export function useEditorPageIdContext(): string {
  return use(DocumentPageIdContext);
}
