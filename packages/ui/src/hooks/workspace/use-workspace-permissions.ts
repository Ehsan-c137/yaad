import type { IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";
import type {
  WorkspacePermissions,
  WorkspaceRole,
} from "@yaad/core/types/workspace";

import { evaluateWorkspacePermissions } from "@yaad/core/lib/workspace/workspace-permissions";
import { workspaceMemberService } from "@yaad/core/services/workspace-member-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { useEffect, useState } from "react";

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

type LiveRoleListener = (workspaceId: string, role: WorkspaceRole) => void;

const liveRoleListeners = new Set<LiveRoleListener>();

export function emitLiveWorkspaceRoleChange(
  workspaceId: string,
  role: WorkspaceRole,
): void {
  liveRoleListeners.forEach((fn) => {
    try {
      fn(workspaceId, role);
    } catch (err) {
      console.error("Error in live role change listener:", err);
    }
  });
}

export function onLiveWorkspaceRoleChange(
  listener: LiveRoleListener,
): () => void {
  liveRoleListeners.add(listener);

  return () => {
    liveRoleListeners.delete(listener);
  };
}

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
    if (
      !workspaceId ||
      workspaceId === "ws_personal" ||
      !token ||
      !currentUserId
    ) {
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
        const role: WorkspaceRole = currentMember
          ? currentMember.role
          : "owner";

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

  // Listen for live role updates emitted via WebSockets
  useEffect(() => {
    if (!workspaceId) return;

    return onLiveWorkspaceRoleChange((wsId, newRole) => {
      if (wsId === workspaceId) {
        setPermissionsState({
          ...evaluateWorkspacePermissions(newRole),
          isLoading: false,
        });
      }
    });
  }, [workspaceId]);

  return permissionsState;
}
