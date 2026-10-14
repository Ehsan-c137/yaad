import { Loader2, Users } from "lucide-react";

import { MemberRow } from "./member-row";
import type { MemberListProps } from "./types";

export function MemberList({
  members,
  isLoading,
  currentUserEmail,
  onRemove,
}: MemberListProps) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-0.5">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          Workspace Collaborators ({members.length})
        </span>
        {isLoading && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-border/40 bg-background/50 divide-y divide-border/30">
        {members.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No collaborators yet. Invite someone above!
          </div>
        ) : (
          members.map((member) => (
            <MemberRow
              key={member.id || member.userId}
              member={member}
              currentUserEmail={currentUserEmail}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}
