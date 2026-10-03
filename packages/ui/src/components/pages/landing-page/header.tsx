import { Button } from "@ui/button";
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-dashed border-neutral-300">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleScrollToTop}
          className="flex items-center gap-2 transition-opacity active:opacity-70 cursor-pointer"
        >
          <img alt="yaad logo" src="/yaad-logo.png" className="size-7" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Yaad
          </span>
        </Link>

        {/* Center nav */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {onOpenApp ? (
            <Button
              onClick={onOpenApp}
              size="sm"
              className="h-8 gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/85 cursor-pointer"
            >
              <span>Open Yaad</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Link to={targetWorkspaceHref}>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/85 cursor-pointer"
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
