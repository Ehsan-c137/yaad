"use client";

import type { Edge, Node } from "@xyflow/react";
import type { SidebarPageMap } from "@yaad/core/store/use-sidebar-store";
import type { SimulationNodeDatum } from "d3-force";

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { useMemo } from "react";

export interface NodeColorPalette {
  fill: string;
  stroke: string;
  glow: string;
}

export interface PageNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  icon?: string;
  childCount: number;
  connectionCount: number;
  radius: number;
  color: NodeColorPalette;
  isRoot: boolean;
  showLabels?: boolean;
  isHovered?: boolean;
  isNeighbor?: boolean;
  isDimmed?: boolean;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  title: string;
  icon?: string;
  childCount: number;
  connectionCount: number;
  radius: number;
  color: NodeColorPalette;
  rootIndex: number;
  isRoot: boolean;
}

const OBSIDIAN_PALETTE: NodeColorPalette[] = [
  { fill: "var(--primary)", stroke: "var(--primary)", glow: "var(--ring)" }, // App main color (Primary)
  { fill: "#06b6d4", stroke: "#22d3ee", glow: "rgba(6, 182, 212, 0.45)" }, // Cyan
  { fill: "#10b981", stroke: "#34d399", glow: "rgba(16, 185, 129, 0.45)" }, // Emerald
  { fill: "#f59e0b", stroke: "#fbbf24", glow: "rgba(245, 158, 11, 0.45)" }, // Amber
  { fill: "#ec4899", stroke: "#f472b6", glow: "rgba(236, 72, 153, 0.45)" }, // Pink
  { fill: "#8b5cf6", stroke: "#a78bfa", glow: "rgba(139, 92, 246, 0.45)" }, // Violet
];

const ORPHAN_COLOR: NodeColorPalette = {
  fill: "#64748b",
  stroke: "#475569",
  glow: "#94a3b8",
};

/** Calculates circle dot radius based on connection degree and root status */
function computeNodeRadius(degree: number, isRoot: boolean): number {
  if (degree === 0) return 6;
  const base = isRoot ? 8 : 6;
  return Math.min(20, Math.round(base + Math.sqrt(degree) * 3.5));
}

/** Page ids visible in the graph: the focused page's subtree, or every page */
function collectVisibleIds(
  pages: SidebarPageMap,
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
    const page = id ? pages[id] : undefined;
    if (!id || !page || page.isDeleted || visibleIds.has(id)) continue;

    visibleIds.add(id);
    queue.push(
      ...(page.childrenIds || []).filter(
        (childId) => !pages[childId]?.isDeleted,
      ),
    );
  }

  return visibleIds;
}

/** Assigns each page the index of the top-level root page it belongs to */
function buildRootIndexMap(
  pages: SidebarPageMap,
  rootIds: string[],
): Map<string, number> {
  const rootIndexByPage = new Map<string, number>();
  const rootQueue = [...rootIds];

  rootIds.forEach((id, index) => rootIndexByPage.set(id, index));

  while (rootQueue.length > 0) {
    const id = rootQueue.shift();
    if (!id) continue;

    pages[id]?.childrenIds?.forEach((childId) => {
      if (pages[childId] && !rootIndexByPage.has(childId)) {
        rootIndexByPage.set(childId, rootIndexByPage.get(id) ?? 0);
        rootQueue.push(childId);
      }
    });
  }

  return rootIndexByPage;
}

function buildLinks(
  pages: SidebarPageMap,
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
          type: "straight",
        });

        simLinks.push({ source: id, target: childId });
      }
    });
  });

  return { edges, simLinks };
}

export function useGraphData(
  pages: SidebarPageMap,
  rootPageIds: string[],
  focusPageId?: string,
): { nodes: Node<PageNodeData>[]; edges: Edge[] } {
  return useMemo(() => {
    const pageIds = Object.keys(pages).filter((id) => !pages[id]?.isDeleted);
    if (!pageIds.length) return { nodes: [], edges: [] };

    // When focused on a page, scope the graph to that page's subtree
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

    const { edges, simLinks } = buildLinks(pages, visibleIds, visibleIdSet);

    // Calculate total connections (in-degree + out-degree) for each node
    const degreeMap = new Map<string, number>();
    visibleIds.forEach((id) => degreeMap.set(id, 0));
    simLinks.forEach(({ source, target }) => {
      degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
      degreeMap.set(target, (degreeMap.get(target) || 0) + 1);
    });

    const simNodes: SimNode[] = visibleIds.map((id, index) => {
      const page = pages[id];
      const isRoot = rootIds.includes(id);
      const rootIndex = focusId
        ? 0
        : (rootIndexByPage.get(id) ?? rootIds.length + index);
      const degree = degreeMap.get(id) || 0;
      const radius = computeNodeRadius(degree, isRoot);
      const color =
        degree === 0
          ? ORPHAN_COLOR
          : OBSIDIAN_PALETTE[rootIndex % OBSIDIAN_PALETTE.length];

      const seedAngle = (Math.PI * 2 * index) / Math.max(visibleIds.length, 1);
      const seedRadius = rootIndex === 0 ? 120 : 200;

      return {
        id,
        title: page?.title || "Untitled",
        icon: page?.icon,
        childCount: page?.childrenIds?.length || 0,
        connectionCount: degree,
        radius,
        color,
        rootIndex,
        isRoot,
        x: rootIndex === 0 ? Math.cos(seedAngle) * seedRadius : rootIndex * 260,
        y: rootIndex === 0 ? Math.sin(seedAngle) * seedRadius : 0,
        ...(id === pinnedId ? { fx: 0, fy: 0 } : {}),
      };
    });

    // Run force-directed simulation tuned for Obsidian-style constellation density
    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, { source: string; target: string }>(simLinks)
          .id((d) => d.id)
          .distance(75)
          .strength(0.7),
      )
      .force(
        "charge",
        forceManyBody<SimNode>().strength((d) => -120 - d.connectionCount * 12),
      )
      .force("center", forceCenter(0, 0))
      .force(
        "collide",
        forceCollide<SimNode>((d) => d.radius + 22).iterations(2),
      )
      .stop();

    for (let i = 0; i < 160; ++i) simulation.tick();

    const nodes: Node<PageNodeData>[] = simNodes.map((node) => ({
      id: node.id,
      type: "pageNode",
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        id: node.id,
        title: node.title,
        icon: node.icon,
        childCount: node.childCount,
        connectionCount: node.connectionCount,
        radius: node.radius,
        color: node.color,
        isRoot: node.isRoot,
      },
    }));

    return { nodes, edges };
  }, [pages, rootPageIds, focusPageId]);
}
