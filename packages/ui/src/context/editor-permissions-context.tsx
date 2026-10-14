"use client";

import { createContext, useContext } from "react";
import { evaluateWorkspacePermissions } from "@yaad/core/lib/workspace/workspace-permissions";
import type { WorkspacePermissionsState } from "@/hooks/workspace/use-workspace-permissions";

export type EditorPermissionsContextValue = WorkspacePermissionsState;

const DEFAULT_EDITOR_PERMISSIONS: EditorPermissionsContextValue = {
  ...evaluateWorkspacePermissions("owner"),
  isLoading: false,
};

export const EditorPermissionsContext =
  createContext<EditorPermissionsContextValue>(DEFAULT_EDITOR_PERMISSIONS);
EditorPermissionsContext.displayName = "EditorPermissionsContext";

export function EditorPermissionsProvider({
  value,
  children,
}: {
  value: EditorPermissionsContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorPermissionsContext.Provider value={value}>
      {children}
    </EditorPermissionsContext.Provider>
  );
}

export function useEditorPermissions(): EditorPermissionsContextValue {
  return useContext(EditorPermissionsContext);
}
