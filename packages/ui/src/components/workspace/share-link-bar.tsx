import { Button } from "@ui/button";
import { Check, Copy, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { ShareLinkBarProps } from "./types";

export function ShareLinkBar({ shareUrl }: ShareLinkBarProps) {
  const [copied, setCopied] = useState(false);

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

  return (
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
  );
}
