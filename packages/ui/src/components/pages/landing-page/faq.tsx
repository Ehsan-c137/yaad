import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What makes Yaad different from other note apps?",
    answer:
      "Yaad combines clean, block-based writing with visual note connections—without heavy memory usage, complex setups, or slow startup times. It opens in a flash, feels lightweight, and keeps you focused on writing.",
  },
  {
    question: "Where are my notes and data stored?",
    answer:
      "100% locally on your own machine. On desktop, notes are saved directly to your computer's local drive. In the browser, they are stored securely in your browser's private storage. We never track your keystrokes, run analytics on your notes, or lock your thoughts behind cloud servers.",
  },
  {
    question: "Is Yaad free and open-source?",
    answer:
      "Yes. Yaad is 100% free and open-source. There are no artificial paywalls, document limits, or subscription traps.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Yaad runs as a native app on macOS (Apple Silicon & Intel), Windows 10/11, and Linux. You can also use it directly in any modern web browser with zero installation.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Yes, anytime. Your notes belong completely to you. You can export individual documents or your entire workspace into clean text or standard Markdown files with your links preserved.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <HelpCircle className="size-3.5 text-primary" />
            <span>Got Questions?</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Everything you need to know about Yaad and how it keeps your notes
            private.
          </p>
        </div>

        {/* Accordion list */}
        <div className="mt-12 space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-border/70 bg-card/60 backdrop-blur-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border/40 px-5 pt-3 pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
