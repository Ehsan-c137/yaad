import { Button } from "@ui/button";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { ArrowRight, Download, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { GithubIcon } from "./platform-utils";

export function LandingFooter() {
  const { t } = useTranslation("landing");
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/app";

  return (
    <footer className="relative border-t border-neutral-100 dark:border-neutral-800 bg-background pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* CTA banner */}
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-8 sm:p-12 text-center">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("footer.bannerTitle")}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            {t("footer.bannerDesc")}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#downloads">
              <Button
                size="lg"
                className="h-11 gap-2 rounded-full bg-foreground dark:bg-white px-6 text-sm font-semibold text-background dark:text-black hover:bg-foreground/85 dark:hover:bg-white/85 active:scale-[0.97] cursor-pointer"
              >
                <Download className="size-4" />
                <span>{t("footer.btnDownloadDesktop")}</span>
              </Button>
            </a>

            <Link to={targetWorkspaceHref}>
              <Button
                variant="outline"
                size="lg"
                className="h-11 gap-2 rounded-full border-neutral-200 dark:border-neutral-700 px-6 text-sm font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.97] cursor-pointer"
              >
                <span>{t("footer.btnLaunchWeb")}</span>
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-neutral-100 dark:border-neutral-800 pt-8 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img alt="yaad logo" src="/yaad-logo.png" className="size-6" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Yaad
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {t("footer.tagline")}
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-400 dark:text-neutral-500">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.linkFeatures")}
            </a>
            <a
              href="#downloads"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.linkDownloads")}
            </a>
            <a
              href="#philosophy"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.linkHowItWorks")}
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              {t("footer.linkFaq")}
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <GithubIcon className="size-3.5" />
              <span>{t("footer.linkGithub")}</span>
            </a>
          </div>

          <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            <span>{t("footer.craftedWith")}</span>
            <Heart className="size-3 text-rose-500 fill-rose-500" />
            <span>{t("footer.forThinkers")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
