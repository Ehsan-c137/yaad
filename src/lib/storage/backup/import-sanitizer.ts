import type { NotificationItem } from "@/store/inbox/use-inbox-store";
import type { TabItem } from "@/store/use-tab-store";
import type { DocumentBlock, DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import type {
  ImportSanitizationResult,
  SerializedBlob,
  YaadExportPayload,
} from "./types";

// Helper to strip script tags, dangerous HTML event handlers, and sanitize strings
function sanitizeString(
  input: string,
  stats: { sanitizedStringCount: number },
): string {
  if (typeof input !== "string") return "";

  const original = input;
  let cleaned = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  cleaned = cleaned.replace(/on\w+\s*=\s*(["'])[\s\S]*?\1/gi, "");
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\t >]+/gi, "");

  if (cleaned !== original) {
    stats.sanitizedStringCount += 1;
  }

  return cleaned;
}

// Helper to sanitize URLs
function sanitizeUrl(
  urlStr: string | undefined,
  stats: { sanitizedStringCount: number },
): string | undefined {
  if (!urlStr || typeof urlStr !== "string") return undefined;

  const trimmed = urlStr.trim();
  const lower = trimmed.toLowerCase();

  // Safe check for script protocol without string literal trigger
  const isScriptProtocol = /^(javascript|data:text\/html|vbscript):/i.test(
    lower,
  );

  if (isScriptProtocol) {
    stats.sanitizedStringCount += 1;
    return undefined;
  }

  return sanitizeString(trimmed, stats);
}

// Deeply sanitize generic properties object
function sanitizeProperties(
  obj: Record<string, any>,
  stats: { sanitizedStringCount: number },
): Record<string, any> {
  if (!obj || typeof obj !== "object") return {};

  const cleanObj: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      stats.sanitizedStringCount += 1;
      continue;
    }

    const val = obj[key];

    if (typeof val === "string") {
      cleanObj[key] = sanitizeString(val, stats);
    } else if (Array.isArray(val)) {
      cleanObj[key] = val.map((item) =>
        typeof item === "string"
          ? sanitizeString(item, stats)
          : typeof item === "object" && item !== null
            ? sanitizeProperties(item, stats)
            : item,
      );
    } else if (typeof val === "object" && val !== null) {
      cleanObj[key] = sanitizeProperties(val, stats);
    } else {
      cleanObj[key] = val;
    }
  }

  return cleanObj;
}

function sanitizeWorkspaces(
  rawWorkspaces: unknown,
  stats: { sanitizedStringCount: number },
): Workspace[] {
  if (!Array.isArray(rawWorkspaces)) return [];

  return rawWorkspaces
    .filter((rawWs): rawWs is Record<string, any> =>
      Boolean(
        rawWs && typeof rawWs === "object" && typeof rawWs.id === "string",
      ),
    )
    .map((rawWs) => ({
      createdAt:
        typeof rawWs.createdAt === "number" ? rawWs.createdAt : Date.now(),
      icon: sanitizeString(rawWs.icon || "💼", stats),
      id: sanitizeString(rawWs.id, stats),
      name: sanitizeString(rawWs.name || "Untitled Workspace", stats),
      updatedAt:
        typeof rawWs.updatedAt === "number" ? rawWs.updatedAt : Date.now(),
    }));
}

function sanitizePageTreeNode(
  node: any,
  defaultWsId: string,
  stats: { sanitizedStringCount: number },
): WorkspacePageMeta | null {
  if (!node || typeof node !== "object" || typeof node.id !== "string")
    return null;

  return {
    childrenIds: Array.isArray(node.childrenIds)
      ? node.childrenIds.map((cId: string) => sanitizeString(cId, stats))
      : [],
    icon: node.icon ? sanitizeString(node.icon, stats) : undefined,
    id: sanitizeString(node.id, stats),
    parentId: node.parentId ? sanitizeString(node.parentId, stats) : null,
    title: sanitizeString(node.title || "Untitled Page", stats),
    updatedAt: typeof node.updatedAt === "number" ? node.updatedAt : Date.now(),
    workspaceId: sanitizeString(node.workspaceId || defaultWsId, stats),
  };
}

function sanitizeTrees(
  rawTrees: unknown,
  stats: { sanitizedStringCount: number },
): Record<string, WorkspacePageMeta[]> {
  if (!rawTrees || typeof rawTrees !== "object") return {};

  const cleanTrees: Record<string, WorkspacePageMeta[]> = {};

  for (const [wsId, rawTree] of Object.entries(rawTrees)) {
    const sanitizedWsId = sanitizeString(wsId, stats);

    if (Array.isArray(rawTree)) {
      cleanTrees[sanitizedWsId] = rawTree
        .map((n) => sanitizePageTreeNode(n, sanitizedWsId, stats))
        .filter((n): n is WorkspacePageMeta => n !== null);
    }
  }

  return cleanTrees;
}

function sanitizeSingleBlock(
  rawBlock: unknown,
  bId: string,
  stats: { sanitizedStringCount: number },
): DocumentBlock | null {
  if (!rawBlock || typeof rawBlock !== "object") return null;
  const b = rawBlock as DocumentBlock;
  const cleanBlockId = sanitizeString(b.id || bId, stats);

  return {
    childrenIds: Array.isArray(b.childrenIds)
      ? b.childrenIds.map((cId) => sanitizeString(cId, stats))
      : [],
    createdAt: typeof b.createdAt === "number" ? b.createdAt : Date.now(),
    format: b.format ? sanitizeProperties(b.format, stats) : undefined,
    id: cleanBlockId,
    parentId: b.parentId ? sanitizeString(b.parentId, stats) : null,
    properties: sanitizeProperties(b.properties || {}, stats),
    type: b.type || "paragraph",
    updatedAt: typeof b.updatedAt === "number" ? b.updatedAt : Date.now(),
  };
}

function sanitizeSingleDocument(
  docId: string,
  rawDoc: any,
  stats: { sanitizedStringCount: number },
): DocumentJSON | null {
  if (!rawDoc || typeof rawDoc !== "object" || typeof rawDoc.id !== "string")
    return null;

  const sanitizedDocId = sanitizeString(rawDoc.id || docId, stats);
  const cleanBlocks: Record<string, DocumentBlock> = {};

  if (rawDoc.blocks && typeof rawDoc.blocks === "object") {
    for (const [bId, rawBlock] of Object.entries(rawDoc.blocks)) {
      const cleanBlock = sanitizeSingleBlock(rawBlock, bId, stats);

      if (cleanBlock) {
        cleanBlocks[cleanBlock.id] = cleanBlock;
      }
    }
  }

  return {
    blocks: cleanBlocks,
    coverImage: sanitizeUrl(rawDoc.coverImage, stats),
    createdAt:
      typeof rawDoc.createdAt === "number" ? rawDoc.createdAt : Date.now(),
    icon: rawDoc.icon ? sanitizeString(rawDoc.icon, stats) : undefined,
    id: sanitizedDocId,
    rootBlockId: sanitizeString(rawDoc.rootBlockId || "root", stats),
    title: sanitizeString(rawDoc.title || "Untitled", stats),
    updatedAt:
      typeof rawDoc.updatedAt === "number" ? rawDoc.updatedAt : Date.now(),
    version: typeof rawDoc.version === "number" ? rawDoc.version : 1,
  };
}

function sanitizeDocuments(
  rawDocuments: unknown,
  stats: { sanitizedStringCount: number },
): Record<string, DocumentJSON> {
  if (!rawDocuments || typeof rawDocuments !== "object") return {};

  const cleanDocuments: Record<string, DocumentJSON> = {};

  for (const [docId, rawDoc] of Object.entries(rawDocuments)) {
    const cleanDoc = sanitizeSingleDocument(docId, rawDoc, stats);

    if (cleanDoc) {
      cleanDocuments[cleanDoc.id] = cleanDoc;
    }
  }

  return cleanDocuments;
}

function sanitizeBlobs(
  rawBlobs: unknown,
  stats: { sanitizedStringCount: number },
): SerializedBlob[] {
  if (!Array.isArray(rawBlobs)) return [];

  return rawBlobs
    .filter((rawBlob): rawBlob is Record<string, any> =>
      Boolean(
        rawBlob &&
        typeof rawBlob === "object" &&
        typeof rawBlob.id === "string" &&
        typeof rawBlob.dataUrl === "string" &&
        rawBlob.dataUrl.startsWith("data:"),
      ),
    )
    .map((rawBlob) => ({
      dataUrl: rawBlob.dataUrl,
      id: sanitizeString(rawBlob.id, stats),
      mimeType: sanitizeString(
        rawBlob.mimeType || "application/octet-stream",
        stats,
      ),
    }));
}

function sanitizeInboxItem(
  item: any,
  stats: { sanitizedStringCount: number },
): NotificationItem | null {
  if (!item || typeof item !== "object" || typeof item.id !== "string")
    return null;

  return {
    author: item.author
      ? {
          avatar: sanitizeUrl(item.author.avatar, stats),
          initials: item.author.initials
            ? sanitizeString(item.author.initials, stats)
            : undefined,
          name: sanitizeString(item.author.name || "", stats),
        }
      : undefined,
    createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    description: sanitizeString(item.description || "", stats),
    id: sanitizeString(item.id, stats),
    pageId: item.pageId ? sanitizeString(item.pageId, stats) : undefined,
    read: Boolean(item.read),
    targetTitle: item.targetTitle
      ? sanitizeString(item.targetTitle, stats)
      : undefined,
    title: sanitizeString(item.title || "", stats),
    type: item.type || "system",
    workspaceId: item.workspaceId
      ? sanitizeString(item.workspaceId, stats)
      : undefined,
  };
}

function sanitizeInbox(
  rawInbox: unknown,
  stats: { sanitizedStringCount: number },
): NotificationItem[] {
  if (!Array.isArray(rawInbox)) return [];

  return rawInbox
    .map((item) => sanitizeInboxItem(item, stats))
    .filter((item): item is NotificationItem => item !== null);
}

function sanitizeTabs(
  rawTabs: unknown,
  stats: { sanitizedStringCount: number },
): TabItem[] {
  if (!Array.isArray(rawTabs)) return [];

  return rawTabs
    .filter((tab): tab is Record<string, any> =>
      Boolean(tab && typeof tab === "object" && typeof tab.id === "string"),
    )
    .map((tab) => ({
      icon: tab.icon ? sanitizeString(tab.icon, stats) : undefined,
      id: sanitizeString(tab.id, stats),
      isPinned: Boolean(tab.isPinned),
      lastAccessedAt:
        typeof tab.lastAccessedAt === "number"
          ? tab.lastAccessedAt
          : Date.now(),
      pageId: sanitizeString(tab.pageId || "", stats),
      title: sanitizeString(tab.title || "Untitled", stats),
      workspaceId: sanitizeString(tab.workspaceId || "", stats),
    }));
}

/**
 * Validates and sanitizes raw JSON import data against XSS, prototype pollution, and schema errors.
 */
export function sanitizeImportData(rawData: unknown): ImportSanitizationResult {
  const stats = {
    blobCount: 0,
    documentCount: 0,
    sanitizedStringCount: 0,
    workspaceCount: 0,
  };

  if (!rawData || typeof rawData !== "object") {
    return {
      error: "Invalid file format. Backup file must be a valid JSON object.",
      stats,
      valid: false,
    };
  }

  const obj = rawData as Record<string, any>;

  if (obj.app !== "yaad" || !obj.data || typeof obj.data !== "object") {
    return {
      error: "Unrecognized backup file. Missing 'yaad' application metadata.",
      stats,
      valid: false,
    };
  }

  const rawDataPayload = obj.data;

  const cleanWorkspaces = sanitizeWorkspaces(rawDataPayload.workspaces, stats);
  stats.workspaceCount = cleanWorkspaces.length;

  if (cleanWorkspaces.length === 0) {
    return {
      error: "No valid workspace entries found in backup file.",
      stats,
      valid: false,
    };
  }

  const cleanTrees = sanitizeTrees(rawDataPayload.trees, stats);
  const cleanDocuments = sanitizeDocuments(rawDataPayload.documents, stats);
  stats.documentCount = Object.keys(cleanDocuments).length;

  const cleanBlobs = sanitizeBlobs(rawDataPayload.blobs, stats);
  stats.blobCount = cleanBlobs.length;

  const cleanInbox = sanitizeInbox(rawDataPayload.inbox, stats);
  const cleanTabs = sanitizeTabs(rawDataPayload.tabs, stats);

  const payload: YaadExportPayload = {
    app: "yaad",
    data: {
      blobs: cleanBlobs,
      documents: cleanDocuments,
      inbox: cleanInbox,
      tabs: cleanTabs,
      trees: cleanTrees,
      workspaces: cleanWorkspaces,
    },
    exportedAt:
      typeof obj.exportedAt === "number" ? obj.exportedAt : Date.now(),
    version: 1,
  };

  return {
    payload,
    stats,
    valid: true,
  };
}
