import type { TagColor } from "@yaad/core/types/document";

export const COLOR_OPTIONS: {
  name: string;
  value: TagColor;
  colorClass: string;
}[] = [
  {
    name: "Default",
    value: "default",
    colorClass: "bg-muted text-foreground",
  },
  {
    name: "Gray",
    value: "gray",
    colorClass: "bg-neutral-500/20 text-neutral-700 dark:text-neutral-300",
  },
  {
    name: "Brown",
    value: "brown",
    colorClass: "bg-amber-600/20 text-amber-800 dark:text-amber-300",
  },
  {
    name: "Orange",
    value: "orange",
    colorClass: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  },
  {
    name: "Yellow",
    value: "yellow",
    colorClass: "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300",
  },
  {
    name: "Green",
    value: "green",
    colorClass: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    name: "Blue",
    value: "blue",
    colorClass: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  {
    name: "Purple",
    value: "purple",
    colorClass: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  },
  {
    name: "Pink",
    value: "pink",
    colorClass: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  },
  {
    name: "Red",
    value: "red",
    colorClass: "bg-red-500/20 text-red-700 dark:text-red-300",
  },
];
