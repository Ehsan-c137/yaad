import type { EditorPermissionsContextValue } from "./editor-permissions-context";

import { EditorPermissionsContext } from "./editor-permissions-context";

export function EditorPermissionsProvider({
  value,
  children,
}: {
  value: EditorPermissionsContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorPermissionsContext value={value}>
      {children}
    </EditorPermissionsContext>
  );
}
