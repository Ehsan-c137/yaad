export interface RichTextAnnotation {
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  color?: string;
}

export interface RichTextSegment {
  text: string;
  annotations?: RichTextAnnotation;
  href?: string;
}

export type DocumentBlockType =
  | "bulleted_list"
  | "callout"
  | "code"
  | "column_list"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "image"
  | "link_preview"
  | "page"
  | "paragraph"
  | "quote"
  | "table"
  | "todo";

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  parentId: string | null;
  childrenIds: string[];
  properties: Record<string, any>;
  format?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentJSON {
  version: number;
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  rootBlockId: string;
  blocks: Record<string, DocumentBlock>;
  createdAt: number;
  updatedAt: number;
}
