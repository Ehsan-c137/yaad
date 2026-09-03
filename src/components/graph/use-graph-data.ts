"use client";

import type { Edge, Node } from "@xyflow/react";
import type { SimulationNodeDatum } from "d3-force";

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { useMemo } from "react";

import type { SidebarPageItem } from "@/store/use-sidebar-store";

export interface PageNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  icon?: string;
  childCount: number;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  title: string;
  icon?: string;
  childCount: number;
  rootIndex: number;
}

/** Page ids visible in the graph: the focused page's subtree, or every page */
function collectVisibleIds(
  pages: Record<string, SidebarPageItem>,
  focusId: string | null,
  pageIds: string[],
): Set<string> {
  const visibleIds = new Set<string>();

  if (!focusId) {
    pageIds.forEach((id) => visibleIds.add(id));
    return visibleIds;
  }

  const queue = [focusId];

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || !(id in pages) || pages[id].isDeleted || visibleIds.has(id))
      continue;

    visibleIds.add(id);
    queue.push(
      ...(pages[id].childrenIds || []).filter(
        (childId) => !pages[childId]?.isDeleted,
      ),
    );
  }

  return visibleIds;
}

/** Assigns each page the index of the top-level root page it belongs to */
function buildRootIndexMap(
  pages: Record<string, SidebarPageItem>,
  rootIds: string[],
): Map<string, number> {
  const rootIndexByPage = new Map<string, number>();
  const rootQueue = [...rootIds];

  rootIds.forEach((id, index) => rootIndexByPage.set(id, index));

  while (rootQueue.length > 0) {
    const id = rootQueue.shift();
    if (!id) continue;

    pages[id].childrenIds?.forEach((childId) => {
      if (pages[childId] && !rootIndexByPage.has(childId)) {
        rootIndexByPage.set(childId, rootIndexByPage.get(id) ?? 0);
        rootQueue.push(childId);
      }
    });
  }

  return rootIndexByPage;
}

function buildLinks(
  pages: Record<string, SidebarPageItem>,
  visibleIds: string[],
  visibleIdSet: Set<string>,
): { edges: Edge[]; simLinks: { source: string; target: string }[] } {
  const edges: Edge[] = [];
  const simLinks: { source: string; target: string }[] = [];

  visibleIds.forEach((id) => {
    (pages[id]?.childrenIds || []).forEach((childId) => {
      if (visibleIdSet.has(childId)) {
        edges.push({
          id: `${id}→${childId}`,
          source: id,
          target: childId,
          type: "default",
          style: {
            stroke: "#cccccc",
            strokeWidth: 1.5,
          },
        });

        simLinks.push({ source: id, target: childId });
      }
    });
  });

  return { edges, simLinks };
}

export function useGraphData(
  pages: Record<string, SidebarPageItem>,
  rootPageIds: string[],
  focusPageId?: string,
): { nodes: Node<PageNodeData>[]; edges: Edge[] } {
  return useMemo(() => {
    const pageIds = Object.keys(pages).filter((id) => !pages[id]?.isDeleted);
    if (!pageIds.length) return { nodes: [], edges: [] };

    // When focused on a page, scope the graph to that page's subtree
    // (the page itself plus all of its descendants)
    const focusId =
      focusPageId && focusPageId in pages && !pages[focusPageId]?.isDeleted
        ? focusPageId
        : null;
    const visibleIdSet = collectVisibleIds(pages, focusId, pageIds);
    const visibleIds = [...visibleIdSet];
    const rootIds = rootPageIds.filter(
      (id) => pages[id] && !pages[id].isDeleted,
    );
    const fallbackRootId = rootIds[0] || pageIds[0];
    const pinnedId = focusId ?? fallbackRootId;
    const rootIndexByPage = buildRootIndexMap(pages, rootIds);

    const simNodes: SimNode[] = visibleIds.map((id, index) => {
      const rootIndex = focusId
        ? 0
        : (rootIndexByPage.get(id) ?? rootIds.length + index);
      const seedAngle = (Math.PI * 2 * index) / Math.max(visibleIds.length, 1);
      const seedRadius = rootIndex === 0 ? 160 : 260;

      return {
        id,
        title: pages[id].title || "Untitled",
        icon: pages[id].icon,
        childCount: pages[id].childrenIds?.length || 0,
        rootIndex,
        x: rootIndex === 0 ? Math.cos(seedAngle) * seedRadius : rootIndex * 420,
        y: rootIndex === 0 ? Math.sin(seedAngle) * seedRadius : 0,
        ...(id === pinnedId ? { fx: 0, fy: 0 } : {}),
      };
    });

    const { edges, simLinks } = buildLinks(pages, visibleIds, visibleIdSet);

    // Run force calculation
    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, { source: string; target: string }>(simLinks)
          .id((d) => d.id)
          .distance(200), // Distance between connected cards
      )
      .force("charge", forceManyBody().strength(-500))
      .force("center", forceCenter(0, 0))
      .force("collide", forceCollide(110))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    const nodes: Node<PageNodeData>[] = simNodes.map((node) => ({
      id: node.id,
      type: "pageNode",
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        id: node.id,
        title: node.title,
        icon: node.icon,
        childCount: node.childCount,
      },
    }));

    return { nodes, edges };
  }, [pages, rootPageIds, focusPageId]);
}
