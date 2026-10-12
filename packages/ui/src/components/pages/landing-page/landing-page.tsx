import "@/i18n";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LandingBento } from "./bento";
import { LandingDownloads } from "./downloads";
import { LandingFaq } from "./faq";
import { LandingFooter } from "./footer";
import { LandingHeader } from "./header";
import { LandingHero } from "./hero";
import { Reveal } from "./reveal";
import { LandingWorkflow } from "./workflow";

interface LandingPageProps {
  onOpenApp?: () => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  const { t } = useTranslation("landing");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("metaTitle");

    return () => {
      document.title = previousTitle;
    };
  }, [t]);

  return (
    <div className="paper-texture relative min-h-screen w-full overflow-x-clip bg-background text-foreground selection:bg-foreground/10 selection:text-foreground scroll-smooth flex flex-col">
      {/* Background Grid Lines (matches max-w-6xl) */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
        <div className="w-full max-w-6xl border-x border-dashed border-neutral-300 dark:border-neutral-700" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-x-clip">
        <LandingHeader onOpenApp={onOpenApp} />

        <main id="main-content" className="flex flex-col overflow-x-clip">
          <Reveal animation="t-stagger">
            <LandingHero onOpenApp={onOpenApp} />
          </Reveal>

          {/* Subtle horizontal separator */}
          <div className="w-full border-b border-dashed border-neutral-300 dark:border-neutral-700" />

          <LandingBento />

          <div className="w-full border-b border-dashed border-neutral-300 dark:border-neutral-700" />

          <Reveal animation="reveal-fade-up">
            <LandingWorkflow />
          </Reveal>

          <div className="w-full border-b border-dashed border-neutral-300 dark:border-neutral-700" />

          <Reveal animation="reveal-scale-up">
            <LandingDownloads />
          </Reveal>

          <div className="w-full border-b border-dashed border-neutral-300 dark:border-neutral-700" />

          <Reveal animation="reveal-fade-up">
            <LandingFaq />
          </Reveal>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

export default LandingPage;
