/* eslint-disable max-lines-per-function */
import { Button } from "@ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

interface LandingHeaderProps {
  onOpenApp?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
] as const;

export function LandingHeader({ onOpenApp }: LandingHeaderProps) {
  const { t, i18n } = useTranslation("landing");
  const currentLanguage = i18n.resolvedLanguage?.startsWith("fa") ? "fa" : "en";

  const navLinks = [
    { href: "#features", label: t("header.features") },
    { href: "#philosophy", label: t("header.howItWorks") },
    { href: "#downloads", label: t("header.downloads") },
    { href: "#faq", label: t("header.faq") },
  ];

  const handleLanguageChange = (val: string | null) => {
    if (val) {
      void i18n.changeLanguage(val);
    }
  };

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
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-dashed border-neutral-300 dark:border-neutral-700">
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
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3 py-1.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400 transition-colors hover:text-foreground dark:hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Select
            value={currentLanguage}
            onValueChange={handleLanguageChange}
            items={LANGUAGE_OPTIONS}
          >
            <SelectTrigger
              size="sm"
              aria-label={t("header.switchLanguage")}
              className="h-8 gap-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-background/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2.5 text-xs font-medium cursor-pointer"
            >
              <Globe className="size-3.5 text-neutral-500 dark:text-neutral-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onOpenApp ? (
            <Button
              onClick={onOpenApp}
              size="sm"
              className="h-8 gap-1.5 rounded-full bg-foreground dark:bg-white px-4 text-[13px] font-medium text-background dark:text-black hover:bg-foreground/85 dark:hover:bg-white/85 cursor-pointer"
            >
              <span>{t("header.openYaad")}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Button>
          ) : (
            <Link to={targetWorkspaceHref}>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-foreground dark:bg-white px-4 text-[13px] font-medium text-background dark:text-black hover:bg-foreground/85 dark:hover:bg-white/85 cursor-pointer"
              >
                <span>{t("header.openYaad")}</span>
                <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
