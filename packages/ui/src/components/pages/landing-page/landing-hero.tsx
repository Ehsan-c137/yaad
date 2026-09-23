import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Globe,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { PlatformType } from "./landing-platform-utils";

import { detectUserPlatform, PLATFORMS_DATA } from "./landing-platform-utils";

interface LandingHeroProps {
  onOpenApp?: () => void;
}

export function LandingHero({ onOpenApp }: LandingHeroProps) {
  const [platform, setPlatform] = useState<PlatformType>("macos");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  useEffect(() => {
    setPlatform(detectUserPlatform());
  }, []);

  const currentPlatform = PLATFORMS_DATA[platform] || PLATFORMS_DATA.macos;
  const CurrentIcon = currentPlatform.icon;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[350px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-md transition-all hover:bg-primary/10">
          <Sparkles className="size-3.5 animate-pulse text-primary" />
          <span>Yaad • Fast, Private Notes & Connected Thoughts</span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
          Where thoughts connect at the{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-accent-blue bg-clip-text text-transparent">
            speed of light.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A clean, distraction-free note editor with visual connections between
          your ideas. Fast, private, and works completely offline with zero
          subscriptions or cloud lock-in.
        </p>

        {/* Platform Download & CTAs */}
        <div className="mx-auto mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {/* Primary Action: OS-Aware Download or Web Launch */}
          <div className="relative flex flex-col sm:flex-row items-center gap-2">
            <a href="#downloads">
              <Button
                size="lg"
                className="h-12 gap-2.5 px-6 font-semibold shadow-md shadow-primary/25 transition-transform active:scale-95 cursor-pointer"
              >
                <CurrentIcon className="size-5 shrink-0" />
                <span>Download for {currentPlatform.name}</span>
                <Download className="size-4 opacity-80" />
              </Button>
            </a>

            {/* Quick platform dropdown trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Select alternative platform"
                className="flex h-12 items-center justify-center rounded-lg border border-border/70 bg-card/60 px-3 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <ChevronDown
                  className={`size-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-14 right-0 z-30 w-56 rounded-xl border border-border/80 bg-popover p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 text-left">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Available Platforms
                  </div>
                  {Object.values(PLATFORMS_DATA).map((p) => {
                    const Icon = p.icon;
                    return (
                      <a
                        key={p.id}
                        href="#downloads"
                        onClick={() => {
                          setPlatform(p.id);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent/40"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{p.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {p.badge}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Action: Launch in Browser / Open App */}
          {onOpenApp ? (
            <Button
              onClick={onOpenApp}
              variant="outline"
              size="lg"
              className="h-12 gap-2 px-6 font-semibold backdrop-blur-md cursor-pointer"
            >
              <Globe className="size-4 text-muted-foreground" />
              <span>Launch in Browser</span>
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Link to={targetWorkspaceHref}>
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 px-6 font-semibold backdrop-blur-md cursor-pointer"
              >
                <Globe className="size-4 text-muted-foreground" />
                <span>Launch in Browser</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Platform metadata caption */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>100% Free & Open-source</span>
          <span>•</span>
          <span>Works Offline</span>
          <span>•</span>
          <span>No Account Required</span>
        </div>
      </div>
    </section>
  );
}
