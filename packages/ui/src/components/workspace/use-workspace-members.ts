import type { IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";
import type {
  WorkspaceMember,
  WorkspaceRole,
} from "@yaad/core/types/workspace";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface UseWorkspaceMembersOptions {
  workspaceId: string;
  memberService: IWorkspaceMemberService;
  isAuthenticated: boolean;
  isOpen: boolean;
}

export function useWorkspaceMembers({
  workspaceId,
  memberService,
  isAuthenticated,
  isOpen,
}: UseWorkspaceMembersOptions) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!isAuthenticated) {
      setMembers([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    memberService
      .getMembers(workspaceId)
      .then((data) => {
        if (isMounted) {
          setMembers(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load workspace members:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, workspaceId, isAuthenticated, memberService]);

  const addMember = async (email: string, role: WorkspaceRole) => {
    const trimmed = email.trim();
    if (!trimmed) return;

    const added = await memberService.addMember(workspaceId, {
      email: trimmed,
      role,
    });

    setMembers((prev) => {
      const filtered = prev.filter((m) => m.userId !== added.userId);
      return [...filtered, added];
    });

    toast.success(
      t("memberAdded", {
        email: trimmed,
        role: role === "member" ? t("editor") : t("viewer"),
      }),
    );
    return added;
  };

  const removeMember = async (userId: string, email: string) => {
    await memberService.removeMember(workspaceId, userId);
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
    toast.success(t("memberRemoved", { email }));
  };

  const updateMemberRole = async (userId: string, newRole: WorkspaceRole) => {
    const target = members.find((m) => m.userId === userId);
    if (!target) return;

    const updated = await memberService.addMember(workspaceId, {
      email: target.email,
      role: newRole,
    });

    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)),
    );

    toast.success(
      t("roleUpdated", {
        email: target.email,
        role: newRole === "member" ? t("editor") : t("viewer"),
      }),
    );
    return updated;
  };

  return {
    members,
    isLoading,
    addMember,
    removeMember,
    updateMemberRole,
  };
}
