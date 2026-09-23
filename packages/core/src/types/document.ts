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
  | "kanban"
  | "link_preview"
  | "page"
  | "paragraph"
  | "quote"
  | "separator"
  /** @deprecated Legacy spelling alias; use "separator" instead */
  | "seperator"
  | "table"
  | "todo";

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  parentId: string | null;
  childrenIds: string[];
  properties: Record<string, any>;
  format?: Record<string, any>;
  tags?: Tag[];
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

export type TagColor =
  | "blue"
  | "brown"
  | "default"
  | "gray"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "yellow";

export interface TagLocation {
  pageId: string;
  pageTitle?: string;
  blockId?: string;
  blockType?: DocumentBlockType;
  snippet?: string;
  updatedAt?: number;
}

export interface TagMetadata {
  pageId?: string;
  pageTitle?: string;
  blockId?: string;
  blockType?: DocumentBlockType;
  snippet?: string;
  updatedAt?: number;
  locations?: TagLocation[];
}

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  pageId?: string;
  blockId?: string;
  metadata?: TagMetadata;
}
