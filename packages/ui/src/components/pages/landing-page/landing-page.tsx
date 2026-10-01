import { useEffect } from "react";

import { LandingBento } from "./bento";
import { LandingDownloads } from "./downloads";
import { LandingFaq } from "./faq";
import { LandingFooter } from "./footer";
import { LandingHeader } from "./header";
import { LandingHero } from "./hero";
import { LandingWorkflow } from "./workflow";

interface LandingPageProps {
  onOpenApp?: () => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Yaad — Fast, Private Notes & Connected Ideas";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary scroll-smooth">
      <LandingHeader onOpenApp={onOpenApp} />

      <main id="main-content" className="flex flex-col">
        <LandingHero onOpenApp={onOpenApp} />

        <LandingBento />

        <LandingWorkflow />

        <LandingDownloads />

        <LandingFaq />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
