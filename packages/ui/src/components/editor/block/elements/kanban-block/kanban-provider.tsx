import type { KanbanActionsContextType } from "./kanban-context";

import { KanbanActionsContext } from "./kanban-context";

export function KanbanActionsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: KanbanActionsContextType;
}) {
  return <KanbanActionsContext value={value}>{children}</KanbanActionsContext>;
}
