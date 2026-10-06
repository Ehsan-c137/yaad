import type { TagIndexRecord } from "@yaad/core/lib/storage/types";
import type {
  DocumentBlock,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";

export interface SearchPageMeta {
  icon?: string;
  id: string;
  title: string;
  updatedAt?: number;
}

export interface SearchDocumentReader {
  getDocument: (id: string) => Promise<DocumentJSON | null>;
}

export interface SearchTagIndexReader {
  getTagsIndex?: (tagId?: string) => Promise<TagIndexRecord[]>;
}

export interface PageStateProvider {
  getPages: () => Record<string, SearchPageMeta | undefined>;
}

export interface TagStateProvider {
  getTags: () => Tag[];
}

export type BlockSnippetExtractor = (
  block: DocumentBlock,
  maxLength?: number,
) => string;

export interface IndexedDbSearchProviderOptions {
  documentReader?: SearchDocumentReader;
  extractSnippet?: BlockSnippetExtractor;
  pageStateProvider?: PageStateProvider;
  tagIndexReader?: SearchTagIndexReader;
  tagStateProvider?: TagStateProvider;
}
