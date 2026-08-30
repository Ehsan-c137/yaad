import {
  CheckSquare,
  Code,
  FileText,
  Globe2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  Quote,
  Table,
  Text,
  Type,
} from "lucide-react";

import type { DocumentBlockType } from "@/types/document";

export interface SlashOption {
  id: string;
  title: string;
  description: string;
  type: DocumentBlockType;
  icon: any;
}

export const SLASH_OPTIONS: SlashOption[] = [
  {
    id: "text",
    title: "Text",
    description: "Just start writing with plain text.",
    type: "paragraph",
    icon: Type,
  },
  {
    id: "h1",
    title: "Heading 1",
    description: "Big section heading.",
    type: "heading_1",
    icon: Heading1,
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "Medium section heading.",
    type: "heading_2",
    icon: Heading2,
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "Small section heading.",
    type: "heading_3",
    icon: Heading3,
  },
  {
    id: "bullet_list",
    title: "Bulleted list",
    description: "Create a simple bulleted list.",
    type: "bulleted_list",
    icon: List,
  },
  {
    id: "todo",
    title: "To-do list",
    description: "Track tasks with a checkable list.",
    type: "todo",
    icon: CheckSquare,
  },
  {
    id: "code",
    title: "Code",
    description: "Capture code snippet with syntax styling.",
    type: "code",
    icon: Code,
  },
  {
    id: "quote",
    title: "Quote",
    description: "Capture a quote or highlight statement.",
    type: "quote",
    icon: Quote,
  },
  {
    id: "callout",
    title: "Callout",
    description: "Capture a quote or highlight statement.",
    type: "callout",
    icon: Text,
  },
  {
    id: "table",
    title: "Table",
    description: "add your table",
    type: "table",
    icon: Table,
  },
  {
    id: "image",
    title: "Image",
    description: "choose your image",
    type: "image",
    icon: ImageIcon,
  },
  {
    id: "page",
    title: "Page",
    description: "Embed a sub-page inside this page.",
    type: "page",
    icon: FileText,
  },
  {
    id: "link_preview",
    title: "Link preview",
    description: "add your link.",
    type: "link_preview",
    icon: Globe2,
  },
];
