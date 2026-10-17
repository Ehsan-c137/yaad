"use client";

import type { Workspace } from "@yaad/core/types/workspace";

import { Button } from "@ui/button";
import { workspaceMemberService } from "@yaad/core/services/workspace-member-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Loader2, LogIn, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AuthModal } from "@/components/auth/auth-modal";

export interface JoinWorkspacePromptProps {
  workspaceId: string;
  onJoined?: (workspace: Workspace) => void;
}

export function JoinWorkspacePrompt({
  workspaceId,
  onJoined,
}: JoinWorkspacePromptProps) {
  const { t } = useTranslation();
  const token = useUserStore((s) => s.token);
  const isAuthenticated = Boolean(token);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setIsJoining(true);

    try {
      const res = await workspaceMemberService.joinWorkspace(workspaceId);
      const newWorkspace: Workspace = {
        id: workspaceId,
        name: res.workspaceName ?? "Shared Workspace",
        icon: "🤝",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await useWorkspaceStore.getState().registerWorkspace(newWorkspace);
      toast.success(t("joinedWorkspaceSuccess"));
      onJoined?.(newWorkspace);
    } catch (err: any) {
      toast.error(err.message ?? t("failedJoinWorkspace"));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="mx-auto my-16 max-w-md px-4">
      <div className="flex flex-col items-center rounded-2xl border border-border/40 bg-card/60 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Users className="size-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t("joinWorkspaceTitle")}
        </h2>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {t("joinWorkspaceDesc")}
        </p>

        <div className="mt-4 inline-flex items-center rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
          {workspaceId}
        </div>

        <div className="mt-6 w-full">
          {isAuthenticated ? (
            <Button
              type="button"
              onClick={() => void handleJoin()}
              disabled={isJoining}
              className="w-full gap-2 rounded-xl h-10 font-medium transition-all"
            >
              {isJoining ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              <span>
                {isJoining ? t("joiningWorkspace") : t("joinWorkspace")}
              </span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="w-full gap-2 rounded-xl h-10 font-medium transition-all"
            >
              <LogIn className="size-4" />
              <span>{t("signInToJoin")}</span>
            </Button>
          )}
        </div>
      </div>

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        initialMode="login"
      />
    </div>
  );
}
