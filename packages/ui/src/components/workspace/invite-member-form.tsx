import type { WorkspaceRole } from "@yaad/core/types/workspace";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Loader2, Mail, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import type { InviteMemberFormProps } from "./types";

export function InviteMemberForm({ onInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onInvite(trimmed, role);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">
        Invite Collaborator
      </label>
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="relative min-w-[160px] flex-1">
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
