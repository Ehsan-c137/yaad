import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface LandingHeroProps {
  onOpenApp?: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  return (
    <section className="relative pt-16 pb-16 sm:pt-28 sm:pb-24 overflow-hidden h-[calc(100vh-8rem)] items-center flex justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7ef_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 flex flex-col justify-center items-center">
        {/* Hero heading — large, bold, with inline emoji like time.fyi */}
        <h1 className="mx-auto max-w-[780px] text-center text-[2.5rem] font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-[3.5rem] lg:text-[4rem]">
          <span className="t-stagger-line t-stagger-line--1">
            Your 📝 notes,
          </span>{" "}
          <br />
          <span className="t-stagger-line t-stagger-line--2">
            🔗 connections and
          </span>{" "}
          <br />
          <span className="t-stagger-line t-stagger-line--3">
            🧠 ideas, all in one place.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="t-stagger-line t-stagger-line--4 mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
          Yaad is a fast, private note editor. Capture thoughts, link ideas
          visually, and work completely offline — no account needed.
        </p>

        {/* CTA buttons */}
        <div className="t-stagger-line t-stagger-line--5 mt-8 flex items-center justify-center gap-3">
          {onOpenApp ? (
            <div className="flex flex-col gap-2 md:flex-row">
              <Button
                onClick={onOpenApp}
                size="lg"
                className="h-11 gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-sm hover:bg-foreground/85 active:scale-[0.97] transition-all cursor-pointer"
              >
                Start Writing — It's Free
              </Button>
              <Button
                onClick={onOpenApp}
                variant="outline"
                size="lg"
                className="h-11 gap-2 rounded-full border-neutral-200 dark:border-neutral-700 px-6 text-sm font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.97] transition-all cursor-pointer"
              >
                Launch Web App
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 md:flex-row">
              <Link to={targetWorkspaceHref}>
                <Button
                  size="lg"
                  className="h-11 gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-sm hover:bg-foreground/85 active:scale-[0.97] transition-all cursor-pointer"
                >
                  Start Writing — It's Free
                </Button>
              </Link>
              <Link to={targetWorkspaceHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 gap-2 rounded-full border-neutral-200 dark:border-neutral-700 px-6 text-sm font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.97] transition-all cursor-pointer"
                >
                  Launch Web App
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
