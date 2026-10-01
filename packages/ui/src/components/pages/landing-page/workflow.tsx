import {
  Check,
  Feather,
  GitGraph,
  Link2,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export function LandingWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Feather,
      title: "1. Capture",
      desc: "Open the app in an instant and start typing. Organize thoughts using intuitive blocks and quick slash commands.",
      highlight: "Instant launch & typing",
    },
    {
      icon: Link2,
      title: "2. Structure & Nest",
      desc: "Nest sub-pages infinitely with /page. Organize notes and complex projects with a clean, natural hierarchy.",
      highlight: "Infinite nested pages",
    },
    {
      icon: GitGraph,
      title: "3. Visualize",
      desc: "Open the visual graph to see the big picture. Watch how your notes, ideas, and projects branch out and connect.",
      highlight: "Visual mind map",
    },
    {
      icon: Search,
      title: "4. Find",
      desc: "Press ⌘K anytime. Even years later, find any note, idea, or past meeting summary in a fraction of a second.",
      highlight: "Instant quick search",
    },
  ];

  return (
    <section
      id="philosophy"
      className="py-20 sm:py-28 bg-muted/20 border-y border-border/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            <span>How It Works</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            A natural way to organize your ideas.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Traditional folders can feel rigid and easy to forget. Yaad makes it
            easy to capture ideas quickly and discover how they connect over
            time.
          </p>
        </div>

        {/* 4-Step Interactive Horizontal Cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.title}
                onClick={() => setActiveStep(idx)}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary/60 bg-card shadow-lg ring-1 ring-primary/20"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                }`}
              >
                <div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/40 pt-3">
                  <span className="text-[11px] font-semibold text-primary">
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-xl">
          <div className="border-b border-border/60 bg-muted/40 px-6 py-4">
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              Why people choose Yaad
            </h3>
            <p className="text-xs text-muted-foreground">
              A faster, calmer, and truly private note-taking experience.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="py-3.5 px-6">Feature</th>
                  <th className="py-3.5 px-6 text-primary">Yaad</th>
                  <th className="py-3.5 px-6">Other Note Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-foreground">
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    Data Privacy & Ownership
                  </td>
                  <td className="py-3.5 px-6 text-primary font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Saved directly on your device
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    Stored on company cloud servers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Offline Access</td>
                  <td className="py-3.5 px-6 text-primary font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Works 100% offline, anytime, anywhere
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    Often requires an active internet connection
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Note Organization</td>
                  <td className="py-3.5 px-6 text-primary font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Flexible note links and visual mind map
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    Rigid, buried folder trees
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Speed & Startup</td>
                  <td className="py-3.5 px-6 text-primary font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Opens instantly with zero loading delay
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    Slow loading screens and syncing delays
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    Pricing & Accounts
                  </td>
                  <td className="py-3.5 px-6 text-primary font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    100% Free • No account or sign-up needed
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    Mandatory sign-in & subscription fees
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
