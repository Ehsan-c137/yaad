import { Button } from "@ui/button";
import { Shield } from "lucide-react";

import type { GuestNoticeProps } from "./types";

export function GuestNotice({ onSignInClick }: GuestNoticeProps) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-center">
      <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Shield className="size-4" />
      </div>
      <h4 className="text-xs font-semibold text-foreground">
        Sign In to Invite Collaborators
      </h4>
      <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
        You are currently working in offline mode. Sign in to your self-hosted account to assign roles and manage workspace permissions.
      </p>
      <Button
        type="button"
        size="xs"
        className="mt-3 rounded-full"
        onClick={onSignInClick}
      >
        Sign In / Register
      </Button>
    </div>
  );
}
