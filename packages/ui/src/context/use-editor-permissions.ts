import { use } from "react";

import type { EditorPermissionsContextValue } from "./editor-permissions-context";

import { EditorPermissionsContext } from "./editor-permissions-context";

export function useEditorPermissions(): EditorPermissionsContextValue {
  return use(EditorPermissionsContext);
}
