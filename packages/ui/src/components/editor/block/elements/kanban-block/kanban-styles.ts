import type { ColumnStyleTokens, KanbanColumn } from "./types";

export const getColumnStyles = (col: KanbanColumn): ColumnStyleTokens => {
  const key = `${col.id} ${col.title}`.toLowerCase();

  if (
    key.includes("progress") ||
    key.includes("doing") ||
    key.includes("in_progress")
  ) {
    return {
      container:
        "border-blue-500/20 bg-blue-500/5 dark:border-blue-900/40 dark:bg-blue-950/20",
      headerText: "text-blue-600 dark:text-blue-400 font-semibold",
      badge:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border dark:border-blue-800/60",
      dot: "bg-blue-500",
      addCardBtn:
        "text-blue-600/80 hover:bg-blue-500/10 hover:text-blue-600 dark:text-blue-400/80 dark:hover:bg-blue-950/40 dark:hover:text-blue-300",
    };
  }

  if (
    key.includes("done") ||
    key.includes("completed") ||
    key.includes("finish")
  ) {
    return {
      container:
        "border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-900/40 dark:bg-emerald-950/20",
      headerText: "text-emerald-600 dark:text-emerald-400 font-semibold",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      addCardBtn:
        "text-emerald-600/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400/80 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300",
    };
  }

  return {
    container:
      "border-slate-500/20 bg-slate-500/5 dark:border-slate-800/80 dark:bg-zinc-900/40",
    headerText: "text-slate-700 dark:text-slate-300 font-semibold",
    badge:
      "bg-slate-200/80 text-slate-700 dark:bg-zinc-800 dark:text-slate-300 dark:border dark:border-zinc-700/60",
    dot: "bg-slate-400 dark:bg-slate-500",
    addCardBtn: "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
  };
};
