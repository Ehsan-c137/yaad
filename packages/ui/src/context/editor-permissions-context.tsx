import { evaluateWorkspacePermissions } from "@yaad/core/lib/workspace/workspace-permissions";
import { createContext } from "react";

import type { WorkspacePermissionsState } from "@/hooks/workspace/use-workspace-permissions";

export type EditorPermissionsContextValue = WorkspacePermissionsState;

const DEFAULT_EDITOR_PERMISSIONS: EditorPermissionsContextValue = {
  ...evaluateWorkspacePermissions("owner"),
  isLoading: false,
};

export const EditorPermissionsContext =
  createContext<EditorPermissionsContextValue>(DEFAULT_EDITOR_PERMISSIONS);
EditorPermissionsContext.displayName = "EditorPermissionsContext";
