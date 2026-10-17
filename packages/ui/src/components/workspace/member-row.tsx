import { Avatar, AvatarFallback } from "@ui/avatar";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import type { MemberRowProps } from "./types";

export function MemberRow({
  member,
  currentUserEmail,
  canManageRoles,
  onRemove,
  onUpdateRole,
}: MemberRowProps) {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const isOwner = member.role === "owner";
  const isSelf = currentUserEmail === member.email;

  const handleRemove = async () => {
    if (isOwner) return;
    setIsRemoving(true);

    try {
      await onRemove(member.userId);
    } catch (err: any) {
      toast.error(err.message || t("failedRemoveMember"));
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (newRole: any) => {
    if (isOwner || newRole === member.role || !onUpdateRole) return;
    setIsUpdatingRole(true);

    try {
      await onUpdateRole(member.userId, newRole);
    } catch (err: any) {
      toast.error(err.message || t("failedInviteMember"));
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const initial = member.email.charAt(0).toUpperCase();

  const roleLabel = isOwner
    ? t("owner")
    : member.role === "member"
      ? t("editor")
      : t("viewer");

  const badgeText = isOwner
    ? t("owner")
    : member.role === "member"
      ? t("canEdit")
      : t("canView");

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
              <span className="text-[10px] text-muted-foreground">
                ({t("you")})
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground capitalize">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {canManageRoles && !isOwner && onUpdateRole ? (
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isUpdatingRole || isRemoving}
            aria-label={t("collaboratorRole")}
            className="h-6 rounded-md border border-border/40 bg-input/70 px-1.5 py-0.5 text-[10px] text-foreground outline-none transition-colors hover:border-border/60 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/20 dark:bg-input/30"
          >
            <option value="member">{t("canEdit")}</option>
            <option value="viewer">{t("canView")}</option>
          </select>
        ) : (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0.5 font-normal capitalize",
              isOwner &&
                "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium",
              member.role === "member" &&
                "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
              member.role === "viewer" &&
                "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
            )}
          >
            {badgeText}
          </Badge>
        )}

        {!isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRemove}
            disabled={isRemoving}
            title={t("removeMember", { email: member.email })}
            aria-label={t("removeMember", { email: member.email })}
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
