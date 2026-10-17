import { Check, Feather, GitGraph, Link2, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function LandingWorkflow() {
  const { t } = useTranslation("landing");
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Feather,
      title: t("workflow.step1Title"),
      desc: t("workflow.step1Desc"),
      highlight: t("workflow.step1Highlight"),
    },
    {
      icon: Link2,
      title: t("workflow.step2Title"),
      desc: t("workflow.step2Desc"),
      highlight: t("workflow.step2Highlight"),
    },
    {
      icon: GitGraph,
      title: t("workflow.step3Title"),
      desc: t("workflow.step3Desc"),
      highlight: t("workflow.step3Highlight"),
    },
    {
      icon: Search,
      title: t("workflow.step4Title"),
      desc: t("workflow.step4Desc"),
      highlight: t("workflow.step4Highlight"),
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
            {t("workflow.badge")}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.15]">
            {t("workflow.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-neutral-500 dark:text-neutral-400">
            {t("workflow.description")}
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
                className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left rtl:text-right transition-all duration-200 cursor-pointer ${
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
              {t("workflow.tableTitle")}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("workflow.tableSubtitle")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                  <th className="py-3.5 px-6">{t("workflow.colFeature")}</th>
                  <th className="py-3.5 px-6 text-foreground">
                    {t("workflow.colYaad")}
                  </th>
                  <th className="py-3.5 px-6">{t("workflow.colOthers")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50 text-foreground">
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    {t("workflow.rowPrivacyTitle")}
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {t("workflow.rowPrivacyYaad")}
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    {t("workflow.rowPrivacyOthers")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    {t("workflow.rowOfflineTitle")}
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {t("workflow.rowOfflineYaad")}
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    {t("workflow.rowOfflineOthers")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    {t("workflow.rowOrgTitle")}
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {t("workflow.rowOrgYaad")}
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    {t("workflow.rowOrgOthers")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    {t("workflow.rowSpeedTitle")}
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {t("workflow.rowSpeedYaad")}
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    {t("workflow.rowSpeedOthers")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium">
                    {t("workflow.rowPricingTitle")}
                  </td>
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Check className="size-4 text-emerald-500" />
                    {t("workflow.rowPricingYaad")}
                  </td>
                  <td className="py-3.5 px-6 text-neutral-400 dark:text-neutral-500">
                    {t("workflow.rowPricingOthers")}
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
