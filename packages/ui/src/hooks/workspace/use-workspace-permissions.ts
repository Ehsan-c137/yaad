import { useEffect, useState } from "react";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { evaluateWorkspacePermissions } from "@yaad/core/lib/workspace/workspace-permissions";
import { workspaceMemberService, type IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";
import type { WorkspacePermissions, WorkspaceRole } from "@yaad/core/types/workspace";

export interface UseWorkspacePermissionsOptions {
  memberService?: IWorkspaceMemberService;
}

export interface WorkspacePermissionsState extends WorkspacePermissions {
  isLoading: boolean;
}

const DEFAULT_OWNER_PERMISSIONS: WorkspacePermissionsState = {
  ...evaluateWorkspacePermissions("owner"),
  isLoading: false,
};

export function useWorkspacePermissions(
  workspaceId?: string | null,
  options?: UseWorkspacePermissionsOptions,
): WorkspacePermissionsState {
  const currentUserId = useUserStore((s) => s.userId);
  const token = useUserStore((s) => s.token);
  const memberService = options?.memberService ?? workspaceMemberService;

  const [permissionsState, setPermissionsState] =
    useState<WorkspacePermissionsState>(DEFAULT_OWNER_PERMISSIONS);

  useEffect(() => {
    if (!workspaceId || workspaceId === "ws_personal" || !token || !currentUserId) {
      setPermissionsState(DEFAULT_OWNER_PERMISSIONS);
      return;
    }

    let isMounted = true;
    setPermissionsState((prev) => ({ ...prev, isLoading: true }));

    memberService
      .getMembers(workspaceId)
      .then((members) => {
        if (!isMounted) return;

        const currentMember = members.find((m) => m.userId === currentUserId);
        const role: WorkspaceRole = currentMember ? currentMember.role : "owner";

        setPermissionsState({
          ...evaluateWorkspacePermissions(role),
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        // Graceful fallback: maintain owner permissions locally if service is unreachable
        setPermissionsState(DEFAULT_OWNER_PERMISSIONS);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceId, currentUserId, token, memberService]);

  return permissionsState;
}
