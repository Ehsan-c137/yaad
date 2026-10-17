import { useCollab } from "@/hooks/editor/use-collab";

import { CollabContext } from "./collab-context";

export function CollabProvider({
  workspaceId,
  pageId,
  children,
}: {
  workspaceId: string | undefined;
  pageId: string | undefined;
  children: React.ReactNode;
}) {
  const collab = useCollab(workspaceId, pageId);

  return <CollabContext value={collab}>{children}</CollabContext>;
}
