import { ChevronDown } from "lucide-react";
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
    <section
      id="faq"
      className="py-20 sm:py-28 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[15px] text-neutral-500 dark:text-neutral-400">
            Everything you need to know about Yaad and how it keeps your notes
            private.
          </p>
        </div>

        <div className="mt-12 space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-neutral-100 dark:border-neutral-800 bg-background transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground transition-colors hover:text-foreground/80 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 pt-3 pb-5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 animate-in fade-in slide-in-from-top-1 duration-200">
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
