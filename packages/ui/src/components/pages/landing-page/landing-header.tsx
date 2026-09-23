import { Button } from "@ui/button";
import { ToggleThemeButton } from "@ui/toggle-theme-button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface LandingHeaderProps {
  onOpenApp?: () => void;
}

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#philosophy", label: "How It Works" },
  { href: "#downloads", label: "Downloads" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader({ onOpenApp }: LandingHeaderProps) {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.slice(1);
      const element = document.getElementById(targetId);

      if (element) {
        const headerOffset = 72;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        window.history.pushState(null, "", href);
      }
    }
  };

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      window.location.pathname === "/landing" ||
      window.location.pathname === "/"
    ) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={handleScrollToTop}
          className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95 cursor-pointer"
        >
          <div className="relative flex size-9 items-center justify-center rounded-xl text-primary-foreground transition-all duration-300 group-hover:scale-105  group-hover:shadow-primary/35">
            <img alt="yaad logo" src="/yaad-logo.png" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Yaad
            </span>
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Notes & Connected Ideas
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex sm:items-center">
            <ToggleThemeButton />
          </div>

          <a
            href="#downloads"
            onClick={(e) => handleScrollTo(e, "#downloads")}
            className="hidden sm:inline-flex"
          >
            <Button
              variant="ghost"
              size="sm"
              className="font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Get App
            </Button>
          </a>

          {onOpenApp ? (
            <Button
              onClick={onOpenApp}
              size="sm"
              className="gap-1.5 shadow-sm shadow-primary/20 cursor-pointer"
            >
              <span>Open Yaad</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Link to={targetWorkspaceHref}>
              <Button
                size="sm"
                className="gap-1.5 shadow-sm shadow-primary/20 cursor-pointer"
              >
                <span>Open Yaad</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
