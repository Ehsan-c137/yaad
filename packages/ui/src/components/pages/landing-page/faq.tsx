import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FaqItem {
  question: string;
  answer: string;
}

export function LandingFaq() {
  const { t } = useTranslation("landing");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
    {
      question: t("faq.q5"),
      answer: t("faq.a5"),
    },
  ];

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
            {t("faq.badge")}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-[15px] text-neutral-500 dark:text-neutral-400">
            {t("faq.description")}
          </p>
        </div>

        <div className="mt-12 space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-neutral-100 dark:border-neutral-800 bg-background transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left rtl:text-right text-sm font-semibold text-foreground transition-colors hover:text-foreground/80 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 pt-3 pb-5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 animate-in fade-in slide-in-from-top-1 duration-200 text-left rtl:text-right">
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
