import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { workspaceMemberService as defaultMemberService } from "@yaad/core/services/workspace-member-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AuthModal } from "@/components/auth/auth-modal";

import { GuestNotice } from "./guest-notice";
import { InviteMemberForm } from "./invite-member-form";
import { MemberList } from "./member-list";
import { ShareLinkBar } from "./share-link-bar";
import type { ShareModalProps } from "./types";
import { useWorkspaceMembers } from "./use-workspace-members";

export function ShareModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceName = "Workspace",
  workspaceIcon = "📁",
  pageId,
  memberService = defaultMemberService,
}: ShareModalProps) {
  const { t } = useTranslation();
  const token = useUserStore((s) => s.token);
  const currentUserEmail = useUserStore((s) => s.email);
  const isAuthenticated = Boolean(token);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { members, isLoading, addMember, removeMember, updateMemberRole } =
    useWorkspaceMembers({
      workspaceId,
      memberService,
      isAuthenticated,
      isOpen: open,
    });

  const currentMember = members.find((m) => m.email === currentUserEmail);
  const canManageRoles = !currentMember || currentMember.role === "owner";

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/workspace/${workspaceId}${pageId ? `/${pageId}` : ""}`
      : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-4 overflow-hidden p-6 sm:p-7">
          <DialogHeader className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-base">
                {workspaceIcon}
              </span>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {t("shareWorkspaceTitle", { name: workspaceName })}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("shareWorkspaceDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1 pe-1 -me-1">
            <ShareLinkBar shareUrl={shareUrl} />

            {!isAuthenticated ? (
              <GuestNotice onSignInClick={() => setIsAuthOpen(true)} />
            ) : (
              <>
                <InviteMemberForm
                  onInvite={async (email, role) => {
                    await addMember(email, role);
                  }}
                />

                <MemberList
                  members={members}
                  isLoading={isLoading}
                  currentUserEmail={currentUserEmail}
                  canManageRoles={canManageRoles}
                  onRemove={async (userId) => {
                    const target = members.find((m) => m.userId === userId);
                    if (target) {
                      await removeMember(userId, target.email);
                    }
                  }}
                  onUpdateRole={async (userId, role) => {
                    await updateMemberRole(userId, role);
                  }}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        initialMode="login"
      />
    </>
  );
}

export * from "./types";
