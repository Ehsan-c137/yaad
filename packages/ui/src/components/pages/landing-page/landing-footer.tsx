import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight, Download, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router";

import { GithubIcon } from "./landing-platform-utils";

export function LandingFooter() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  return (
    <footer className="relative border-t border-border/40 bg-muted/10 pt-16 pb-12 overflow-hidden">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-primary/10 blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Call to Action Box */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/80 to-card/60 p-8 sm:p-14 text-center shadow-xl backdrop-blur-2xl">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Start in Seconds</span>
            </span>

            <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready for a calmer, faster way to take notes?
            </h3>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              No sign-up or credit card required. Download the desktop app or
              start writing in your browser right away.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a href="#downloads">
                <Button
                  size="lg"
                  className="h-12 gap-2 px-6 font-semibold shadow-md shadow-primary/25 cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>Download Desktop App</span>
                </Button>
              </a>

              <Link to={targetWorkspaceHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 gap-2 px-6 font-semibold backdrop-blur-md cursor-pointer"
                >
                  <span>Launch Web App</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Brand & Links footer bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-xl text-primary-foreground transition-all duration-300 group-hover:scale-105  group-hover:shadow-primary/35">
              <img alt="yaad logo" src="/yaad-logo.png" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Yaad
            </span>
            <span className="text-xs text-muted-foreground">
              • Simple & Connected Notes
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
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

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="size-3 text-rose-500 fill-rose-500" />
            <span>for thinkers & creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
