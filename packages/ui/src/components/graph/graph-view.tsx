"use client";

import "@xyflow/react/dist/style.css";

import type { Edge, Node, NodeMouseHandler } from "@xyflow/react";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import type { PageNodeData } from "./use-graph-data";

import { GraphNodePreview } from "./graph-node-preview";
import { PageNode } from "./page-node";

const NODE_TYPES = { pageNode: PageNode };

interface PreviewState {
  pageId: string;
  title: string;
  icon?: string;
  anchorX: number;
  anchorY: number;
}

interface GraphCanvasProps {
  nodes?: Node<PageNodeData>[];
  edges?: Edge[];
  workspaceId: string;
}

function GraphCanvas({ nodes, edges, workspaceId }: GraphCanvasProps) {
  const isDark = useTheme();
  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  // Manage nodes and edges state for smooth dragging and interaction
  const [canvasNodes, setCanvasNodes, onNodesChange] = useNodesState(
    nodes || [],
  );
  const [canvasEdges, setCanvasEdges, onEdgesChange] = useEdgesState(
    edges || [],
  );

  useEffect(() => {
    setCanvasNodes(nodes || []);
  }, [nodes, setCanvasNodes]);

  useEffect(() => {
    setCanvasEdges(edges || []);
  }, [edges, setCanvasEdges]);

  // Fit view once initial nodes are ready
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const id = setTimeout(
        () => void fitView({ padding: 0.25, duration: 600 }),
        100,
      );
      return () => clearTimeout(id);
    }
  }, [nodes?.length, fitView, nodes]);

  // Precompute adjacency map from edges for instant neighbor lookup
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    canvasEdges.forEach((edge) => {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    });
    return map;
  }, [canvasEdges]);

  // Derive display nodes with hover/neighbor/dimmed states
  const displayNodes = useMemo(() => {
    const neighbors = hoveredNodeId
      ? adjacencyMap.get(hoveredNodeId) ?? new Set<string>()
      : null;

    return canvasNodes.map((node) => {
      const isHovered = node.id === hoveredNodeId;
      const isNeighbor = neighbors ? neighbors.has(node.id) : false;
      const isDimmed = hoveredNodeId !== null && !isHovered && !isNeighbor;

      return {
        ...node,
        data: {
          ...node.data,
          showLabels,
          isHovered,
          isNeighbor,
          isDimmed,
        },
      };
    });
  }, [canvasNodes, hoveredNodeId, adjacencyMap, showLabels]);

  // Derive display edges with hover highlighting
  const displayEdges = useMemo(() => {
    const defaultStroke = isDark
      ? "rgba(148, 163, 184, 0.25)"
      : "rgba(100, 116, 139, 0.3)";
    const highlightStroke = "var(--primary)";
    const dimmedStroke = isDark
      ? "rgba(148, 163, 184, 0.06)"
      : "rgba(100, 116, 139, 0.08)";

    return canvasEdges.map((edge) => {
      if (!hoveredNodeId) {
        return {
          ...edge,
          style: {
            stroke: defaultStroke,
            strokeWidth: 1.2,
          },
          zIndex: 1,
        };
      }

      const isConnected =
        edge.source === hoveredNodeId || edge.target === hoveredNodeId;

      return {
        ...edge,
        style: {
          stroke: isConnected ? highlightStroke : dimmedStroke,
          strokeWidth: isConnected ? 2.2 : 1,
          opacity: isConnected ? 1 : 0.15,
        },
        zIndex: isConnected ? 10 : 1,
      };
    });
  }, [canvasEdges, hoveredNodeId, isDark]);

  const handleNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handleNodeClick: NodeMouseHandler = useCallback((event, node: Node) => {
    const data = node.data as PageNodeData;
    const nativeEvent = event as unknown as MouseEvent;
    const anchorX = nativeEvent.clientX || window.innerWidth / 2;
    const anchorY = nativeEvent.clientY || window.innerHeight / 2;

    setPreview({
      pageId: data.id,
      title: data.title,
      icon: data.icon,
      anchorX,
      anchorY,
    });
  }, []);

  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node: Node) => {
      navigate(`/workspace/${workspaceId}/${node.id}`);
    },
    [navigate, workspaceId],
  );

  const handlePaneClick = useCallback(() => {
    setPreview(null);
    setHoveredNodeId(null);
  }, []);

  return (
    <div className={cn("relative size-full", isDark && "dark")}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: false }}
        nodeOrigin={[0.5, 0.5]}
        className="graph-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={
            isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(100, 116, 139, 0.22)"
          }
        />
        <Controls
          showInteractive={false}
          className={cn(
            "rounded-xl! border! border-border/60! bg-background/80! shadow-lg! backdrop-blur-md!",
            "[&_button]:border-border/50! [&_button]:bg-transparent! [&_button]:text-foreground/70!",
            "[&_button:hover]:bg-muted! [&_button:hover]:text-foreground!",
          )}
        />
      </ReactFlow>

      {/* Obsidian-style HUD overlay badge */}
      <div className="pointer-events-auto absolute top-3 end-4 z-10 flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-md backdrop-blur-md">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <span className="size-2 rounded-full bg-primary" />
          {canvasNodes.length} notes
        </span>
        <span className="text-border/80">•</span>
        <span>{canvasEdges.length} links</span>
        <span className="text-border/80">•</span>
        <button
          type="button"
          onClick={() => setShowLabels((prev) => !prev)}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-muted hover:text-foreground"
          title={showLabels ? "Hide text labels" : "Show text labels"}
        >
          {showLabels ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
          <span>{showLabels ? "Labels" : "Dots only"}</span>
        </button>
      </div>

      {/* Floating preview card on node click */}
      {preview && (
        <GraphNodePreview
          key={preview.pageId}
          pageId={preview.pageId}
          title={preview.title}
          icon={preview.icon}
          workspaceId={workspaceId}
          anchorX={preview.anchorX}
          anchorY={preview.anchorY}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

interface GraphViewProps {
  workspaceId: string;
  className?: string;
  nodes?: Node<PageNodeData>[];
  edges?: Edge[];
}

export function GraphView({
  workspaceId,
  className,
  nodes,
  edges,
}: GraphViewProps) {
  return (
    <div className={cn("size-full", className)}>
      <ReactFlowProvider>
        <GraphCanvas workspaceId={workspaceId} nodes={nodes} edges={edges} />
      </ReactFlowProvider>
    </div>
  );
}
