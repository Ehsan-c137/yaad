"use client";

import "@xyflow/react/dist/style.css";

import type { Edge, Node, NodeMouseHandler } from "@xyflow/react";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  const { fitView } = useReactFlow();
  const [preview, setPreview] = useState<PreviewState | null>(null);

  // Fit view once nodes are ready
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const id = setTimeout(
        () => void fitView({ padding: 0.2, duration: 600 }),
        100,
      );
      return () => clearTimeout(id);
    }
  }, [nodes?.length, fitView, nodes]);

  const handleNodeClick: NodeMouseHandler = useCallback((event, node: Node) => {
    const data = node.data as PageNodeData;
    // Get viewport position of click for preview anchoring
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

  const handlePaneClick = useCallback(() => {
    setPreview(null);
  }, []);

  const defaultEdgeOptions = useMemo(
    () => ({
      style: {
        stroke: isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)",
        strokeWidth: 1.5,
      },
    }),
    [isDark],
  );

  return (
    <div className={cn("relative size-full", isDark && "dark")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={handleNodeClick}
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
          color={isDark ? "rgba(138,103,184, 0.8)" : "rgba(100,116,139,0.9)"}
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

      {/* Floating preview card */}
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
