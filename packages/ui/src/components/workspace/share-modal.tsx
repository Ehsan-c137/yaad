"use client";

import type { WorkspaceMember, WorkspaceRole } from "@yaad/core/types/workspace";
import type { IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";

import { Avatar, AvatarFallback } from "@ui/avatar";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import { workspaceMemberService as defaultMemberService } from "@yaad/core/services/workspace-member-service";
import { useUserStore } from "@yaad/core/store/use-user-store";
import {
  Check,
  Copy,
  Globe,
  Loader2,
  Mail,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthModal } from "@/components/auth/auth-modal";
import { cn } from "@/lib/utils";

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName?: string;
  workspaceIcon?: string;
  pageId?: string;
  memberService?: IWorkspaceMemberService;
}

export function ShareModal({
  open,
  onOpenChange,
  workspaceId,
  workspaceName = "Workspace",
  workspaceIcon = "📁",
  pageId,
  memberService = defaultMemberService,
}: ShareModalProps) {
  const token = useUserStore((s) => s.token);
  const currentUserEmail = useUserStore((s) => s.email);

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load members when modal opens and token is available
  useEffect(() => {
    if (!open) return;

    if (!token) {
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
  }, [open, workspaceId, token, memberService]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/workspace/${workspaceId}${pageId ? `/${pageId}` : ""}`
    : "";

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleMemberAdded = (newMember: WorkspaceMember) => {
    setMembers((prev) => {
      const filtered = prev.filter((m) => m.userId !== newMember.userId);
      return [...filtered, newMember];
    });
  };

  const handleMemberRemoved = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-6 sm:p-7">
          <DialogHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-base">
                {workspaceIcon}
              </span>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Share &ldquo;{workspaceName}&rdquo;
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Invite team members by email or copy the link to collaborate in real-time.
            </DialogDescription>
          </DialogHeader>

          {/* Copy Share Link Section */}
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 p-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 text-xs text-muted-foreground">
              <Globe className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate select-all">{shareUrl}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCopy}
              className="shrink-0 gap-1 rounded-lg"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>

          {!token ? (
            /* Guest / Local notice */
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-center">
              <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="size-4" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">Sign In to Invite Collaborators</h4>
              <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
                You are currently working in offline mode. Sign in to your self-hosted account to assign roles and manage workspace permissions.
              </p>
              <Button
                type="button"
                size="xs"
                className="mt-3 rounded-full"
                onClick={() => setIsAuthOpen(true)}
              >
                Sign In / Register
              </Button>
            </div>
          ) : (
            <>
              {/* Invite by Email Form */}
              <InviteMemberForm
                workspaceId={workspaceId}
                memberService={memberService}
                onMemberAdded={handleMemberAdded}
              />

              {/* Members List */}
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
                        workspaceId={workspaceId}
                        currentUserEmail={currentUserEmail}
                        memberService={memberService}
                        onMemberRemoved={handleMemberRemoved}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
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

interface InviteMemberFormProps {
  workspaceId: string;
  memberService: IWorkspaceMemberService;
  onMemberAdded: (member: WorkspaceMember) => void;
}

function InviteMemberForm({
  workspaceId,
  memberService,
  onMemberAdded,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const added = await memberService.addMember(workspaceId, {
        email: trimmed,
        role,
      });
      toast.success(`Added ${trimmed} as ${role === "member" ? "Editor" : "Viewer"}`);
      setEmail("");
      onMemberAdded(added);
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">
        Invite Collaborator
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Mail className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            disabled={isSubmitting}
            className="ps-8 text-xs"
            required
          />
        </div>

        {/* Role Selector */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as WorkspaceRole)}
          disabled={isSubmitting}
          aria-label="Collaborator role"
          className="h-8 rounded-xl border border-border/40 bg-input/70 px-2.5 py-1 text-xs text-foreground outline-none transition-colors hover:border-border/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 dark:bg-input/30"
        >
          <option value="member">Can edit</option>
          <option value="viewer">Can view</option>
        </select>

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !email.trim()}
          className="shrink-0 gap-1.5 rounded-xl text-xs font-semibold"
        >
          {isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <UserPlus className="size-3" />
          )}
          <span>Invite</span>
        </Button>
      </div>
    </form>
  );
}

interface MemberRowProps {
  member: WorkspaceMember;
  workspaceId: string;
  currentUserEmail?: string | null;
  memberService: IWorkspaceMemberService;
  onMemberRemoved: (userId: string) => void;
}

function MemberRow({
  member,
  workspaceId,
  currentUserEmail,
  memberService,
  onMemberRemoved,
}: MemberRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const isOwner = member.role === "owner";
  const isSelf = currentUserEmail === member.email;

  const handleRemove = async () => {
    if (isOwner) return;
    setIsRemoving(true);
    try {
      await memberService.removeMember(workspaceId, member.userId);
      toast.success(`Removed ${member.email}`);
      onMemberRemoved(member.userId);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const initial = member.email.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between p-2.5 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="size-7 bg-primary/10 text-primary">
          <AvatarFallback className="text-[11px] font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-medium text-foreground">
              {member.email}
            </span>
            {isSelf && (
              <span className="text-[10px] text-muted-foreground">(You)</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground capitalize">
            {member.role === "member" ? "Editor" : member.role}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-2 py-0.5 font-normal capitalize",
            isOwner && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium",
            member.role === "member" && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            member.role === "viewer" && "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
          )}
        >
          {isOwner ? "Owner" : member.role === "member" ? "Can Edit" : "Can View"}
        </Badge>

        {!isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRemove}
            disabled={isRemoving}
            title={`Remove ${member.email}`}
            aria-label={`Remove ${member.email}`}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            {isRemoving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
