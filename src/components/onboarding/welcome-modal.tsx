"use client";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useUserStore } from "@/store/use-user-store";

interface WelcomeModalProps {
  /**
   * Controlled open state — used when the modal is opened from elsewhere
   * (e.g. Settings → Account). When omitted, the modal auto-opens on first run.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const isControlled = open !== undefined && onOpenChange !== undefined;

  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const storedName = useUserStore((state) => state.userName);
  const setUserName = useUserStore((state) => state.setUserName);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");

  const dialogOpen = isControlled ? open : internalOpen;

  useEffect(() => {
    if (!isControlled && hasHydrated && !hasOnboarded) {
      setInternalOpen(true);
    }
  }, [isControlled, hasHydrated, hasOnboarded]);

  useEffect(() => {
    if (dialogOpen) {
      setName(storedName ?? "");
    }
  }, [dialogOpen, storedName]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);

      // Dismissing the intro (skip, escape, overlay click) resolves onboarding
      // so it never nags again — the name can be added later in Settings.
      if (!nextOpen) {
        completeOnboarding();
      }
    }

    onOpenChange?.(nextOpen);
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    setUserName(trimmedName ? trimmedName : null);
    completeOnboarding();

    handleOpenChange(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-labelledby="welcome-modal-title"
        className="max-w-sm gap-4 text-center"
        showCloseButton={isControlled}
      >
        <DialogHeader className="items-center gap-3">
          <span
            aria-hidden="true"
            className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-(--accent-blue-subtle) text-(--accent-blue)"
          >
            <Sparkles className="size-5" strokeWidth={1.5} />
          </span>

          <DialogTitle
            id="welcome-modal-title"
            className="text-lg font-semibold tracking-tight"
          >
            {isControlled ? "Your name" : "Welcome to Yaad"}
          </DialogTitle>

          <DialogDescription className="mx-auto max-w-64 text-balance">
            {isControlled
              ? "This is how your profile appears across the app."
              : "A calm space for your notes. What should we call you?"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            aria-label="Your name"
            autoComplete="off"
            maxLength={40}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-center"
          />

          <Button type="submit" size="lg" className="mt-1 w-full">
            {isControlled ? "Save" : "Continue"}
          </Button>

          {!isControlled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => handleOpenChange(false)}
            >
              Skip for now
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
