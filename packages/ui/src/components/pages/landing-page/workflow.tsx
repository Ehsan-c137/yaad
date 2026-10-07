/* eslint-disable max-lines-per-function */
import { Check, Feather, GitGraph, Link2, Search } from "lucide-react";
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
      className="py-20 sm:py-28 border-y border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.15]">
            A natural way to organize your ideas.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-neutral-500 dark:text-neutral-400">
            Traditional folders can feel rigid and easy to forget. Yaad makes it
            easy to capture ideas quickly and discover how they connect.
          </p>
        </div>

        {/* 4-Step cards */}
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                type="button"
                key={step.title}
                onClick={() => setActiveStep(idx)}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-foreground/15 dark:border-foreground/30 bg-white dark:bg-zinc-900 shadow-md"
                    : "border-neutral-100 dark:border-neutral-800 bg-white/60 dark:bg-zinc-950/60 hover:bg-white dark:hover:bg-zinc-950 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm"
                }`}
              >
                <div>
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-foreground dark:bg-white text-background dark:text-black"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <span
                    className={`text-[11px] font-semibold ${isSelected ? "text-primary" : "text-neutral-400 dark:text-neutral-500"}`}
                  >
                    {step.highlight}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-zinc-950 shadow-sm">
          <div className="border-b border-neutral-100 dark:border-neutral-800 px-6 py-4">
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              Why people choose Yaad
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              A faster, calmer, and truly private note-taking experience.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                  <th className="py-3.5 px-6">Feature</th>
                  <th className="py-3.5 px-6 text-foreground">Yaad</th>
                  <th className="py-3.5 px-6">Other Note Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50 text-foreground">
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    Data Privacy & Ownership
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Saved directly on your device
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    Stored on company cloud servers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Offline Access</td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Works 100% offline, anytime, anywhere
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    Often requires an active internet connection
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Note Organization</td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Flexible note links and visual mind map
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    Rigid, buried folder trees
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">Speed & Startup</td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    Opens instantly with zero loading delay
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    Slow loading screens and syncing delays
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    Pricing & Accounts
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    100% Free • No account or sign-up needed
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
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
