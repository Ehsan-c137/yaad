import * as Y from 'yjs';
import type { DocumentBlock, DocumentJSON } from '../../types/document';

/**
 * Converts a standard Yaad DocumentJSON into a collaborative Y.Doc structure.
 */
export function documentJsonToYDoc(
  doc: DocumentJSON,
  targetDoc?: Y.Doc,
): Y.Doc {
  const ydoc = targetDoc ?? new Y.Doc();

  ydoc.transact(() => {
    // 1. Meta map (title, icon, coverImage, etc.)
    const metaMap = ydoc.getMap('meta');
    metaMap.set('id', doc.id);
    metaMap.set('version', doc.version ?? 1);
    metaMap.set('title', doc.title ?? '');
    if (doc.icon) metaMap.set('icon', doc.icon);
    if (doc.coverImage) metaMap.set('coverImage', doc.coverImage);
    metaMap.set('rootBlockId', doc.rootBlockId);
    metaMap.set('createdAt', doc.createdAt ?? Date.now());
    metaMap.set('updatedAt', doc.updatedAt ?? Date.now());

    // 2. Blocks map (blockId -> Y.Map representing block)
    const blocksMap = ydoc.getMap('blocks');
    if (doc.blocks && typeof doc.blocks === 'object') {
      for (const [blockId, block] of Object.entries(doc.blocks)) {
        const blockMap = new Y.Map();
        blockMap.set('id', block.id);
        blockMap.set('type', block.type);
        blockMap.set('parentId', block.parentId);
        blockMap.set('childrenIds', block.childrenIds ?? []);
        blockMap.set('properties', block.properties ?? {});
        if (block.format) blockMap.set('format', block.format);
        if (block.tags) blockMap.set('tags', block.tags);
        blockMap.set('createdAt', block.createdAt ?? Date.now());
        blockMap.set('updatedAt', block.updatedAt ?? Date.now());

        blocksMap.set(blockId, blockMap);
      }
    }
  });

  return ydoc;
}

/**
 * Extracts canonical DocumentJSON from a collaborative Y.Doc.
 */
export function yDocToDocumentJson(ydoc: Y.Doc): DocumentJSON {
  const metaMap = ydoc.getMap('meta');
  const blocksMap = ydoc.getMap('blocks');

  const blocksObj: Record<string, DocumentBlock> = {};

  blocksMap.forEach((val: any, key: string) => {
    if (val instanceof Y.Map) {
      blocksObj[key] = {
        id: val.get('id') ?? key,
        type: val.get('type') ?? 'paragraph',
        parentId: val.get('parentId') ?? null,
        childrenIds: val.get('childrenIds') ?? [],
        properties: val.get('properties') ?? {},
        format: val.get('format'),
        tags: val.get('tags'),
        createdAt: val.get('createdAt') ?? Date.now(),
        updatedAt: val.get('updatedAt') ?? Date.now(),
      };
    } else if (val && typeof val === 'object') {
      blocksObj[key] = val as DocumentBlock;
    }
  });

  return {
    id: (metaMap.get('id') as string) ?? '',
    version: (metaMap.get('version') as number) ?? 1,
    title: (metaMap.get('title') as string) ?? '',
    icon: metaMap.get('icon') as string | undefined,
    coverImage: metaMap.get('coverImage') as string | undefined,
    rootBlockId: (metaMap.get('rootBlockId') as string) ?? '',
    blocks: blocksObj,
    createdAt: (metaMap.get('createdAt') as number) ?? Date.now(),
    updatedAt: (metaMap.get('updatedAt') as number) ?? Date.now(),
  };
}
