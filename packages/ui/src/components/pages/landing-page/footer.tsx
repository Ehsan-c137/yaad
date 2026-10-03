import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight, Download, Heart } from "lucide-react";
import { Link } from "react-router";

import { GithubIcon } from "./platform-utils";

export function LandingFooter() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  return (
    <footer className="relative border-t border-neutral-100 bg-white pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* CTA banner */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 sm:p-12 text-center">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Ready for a calmer, faster way to take notes?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
            No sign-up or credit card required. Download the desktop app or
            start writing in your browser right away.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#downloads">
              <Button
                size="lg"
                className="h-11 gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/85 active:scale-[0.97] cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download Desktop App</span>
              </Button>
            </a>

            <Link to={targetWorkspaceHref}>
              <Button
                variant="outline"
                size="lg"
                className="h-11 gap-2 rounded-full border-neutral-200 px-6 text-sm font-semibold text-foreground hover:bg-neutral-50 active:scale-[0.97] cursor-pointer"
              >
                <span>Launch Web App</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-neutral-100 pt-8 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img alt="yaad logo" src="/yaad-logo.png" className="size-6" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Yaad
            </span>
            <span className="text-xs text-neutral-400">
              • Simple & Connected Notes
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-400">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#downloads"
              className="hover:text-foreground transition-colors"
            >
              Downloads
            </a>
            <a
              href="#philosophy"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <GithubIcon className="size-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="size-3 text-rose-500 fill-rose-500" />
            <span>for thinkers & creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
