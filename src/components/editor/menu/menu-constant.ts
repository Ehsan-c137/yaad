import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  Quote,
  Type,
} from "lucide-react";

import type { DocumentBlockType as BlockType } from "@/types/document";

export const TURN_INTO_OPTIONS = [
  { label: "Text", type: "paragraph" as BlockType, icon: Type },
  { label: "Heading 1", type: "heading_1" as BlockType, icon: Heading1 },
  { label: "Heading 2", type: "heading_2" as BlockType, icon: Heading2 },
  { label: "Heading 3", type: "heading_3" as BlockType, icon: Heading3 },
  { label: "To-do list", type: "todo" as BlockType, icon: CheckSquare },
  { label: "Bulleted list", type: "bulleted_list" as BlockType, icon: List },
  { label: "Code", type: "code" as BlockType, icon: Code },
  { label: "Quote", type: "quote" as BlockType, icon: Quote },
];

export const COLOR_OPTIONS = [
  { name: "Default", textClass: "text-inherit", bgClass: "bg-transparent" },
  { name: "Gray", textClass: "text-neutral-500", bgClass: "bg-neutral-500/10" },
  {
    name: "Brown",
    textClass: "text-amber-700 dark:text-amber-500",
    bgClass: "bg-amber-600/10",
  },
  {
    name: "Orange",
    textClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-500/10",
  },
  {
    name: "Yellow",
    textClass: "text-yellow-600 dark:text-yellow-400",
    bgClass: "bg-yellow-500/10",
  },
  {
    name: "Green",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    name: "Blue",
    textClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  {
    name: "Purple",
    textClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  {
    name: "Pink",
    textClass: "text-pink-600 dark:text-pink-400",
    bgClass: "bg-pink-500/10",
  },
  {
    name: "Red",
    textClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10",
  },
];
