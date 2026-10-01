import {
  CheckSquare,
  Columns2,
  FileText,
  Network,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  category: "core" | "feature" | "storage";
  connections: string[];
  snippet: string;
}

const GRAPH_NODES: NodeData[] = [
  {
    id: "hub",
    label: "Yaad Core",
    x: 50,
    y: 50,
    category: "core",
    connections: ["editor", "graph", "offline", "spotlight"],
    snippet: "Your personal knowledge workspace with instant local sync.",
  },
  {
    id: "editor",
    label: "Block Canvas",
    x: 24,
    y: 28,
    category: "feature",
    connections: ["hub", "graph"],
    snippet: "Clean typography, slash commands, and flexible block editing.",
  },
  {
    id: "graph",
    label: "Neural Graph",
    x: 76,
    y: 28,
    category: "feature",
    connections: ["hub", "editor", "spotlight"],
    snippet: "Connected links that automatically show related notes.",
  },
  {
    id: "offline",
    label: "SQLite & IndexedDB",
    x: 26,
    y: 74,
    category: "storage",
    connections: ["hub"],
    snippet: "100% offline privacy with no tracking or cloud lock-in.",
  },
  {
    id: "spotlight",
    label: "0ms Spotlight (⌘K)",
    x: 74,
    y: 74,
    category: "feature",
    connections: ["hub", "graph"],
    snippet: "Instant search across all your notes in milliseconds.",
  },
];

export function LandingSimulator() {
  const [activeTab, setActiveTab] = useState<"editor" | "graph" | "split">(
    "editor",
  );
  const [activeNode, setActiveNode] = useState<string>("hub");
  const [todos, setTodos] = useState([
    {
      id: "1",
      text: "Organize project ideas and research notes",
      done: true,
    },
    {
      id: "2",
      text: "Draft weekly goals and outline reading list",
      done: true,
    },
    {
      id: "3",
      text: "Publish universal desktop packages (macOS, Windows, Linux)",
      done: false,
    },
    {
      id: "4",
      text: "Organize architecture with nested sub-pages",
      done: true,
    },
  ]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  };

  const selectedNode =
    GRAPH_NODES.find((n) => n.id === activeNode) || GRAPH_NODES[0];

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-border/60 bg-card/60 p-2 shadow-2xl backdrop-blur-2xl transition-all sm:p-4">
      {/* Outer ambient glow */}
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-xl" />

      {/* App Window Chrome */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-inner">
        {/* Window Top Bar */}
        <div className="flex h-11 items-center justify-between border-b border-border/60 bg-muted/30 px-4">
          {/* macOS window controls */}
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-rose-500/80 shadow-xs" />
            <div className="size-3 rounded-full bg-amber-500/80 shadow-xs" />
            <div className="size-3 rounded-full bg-emerald-500/80 shadow-xs" />
          </div>

          {/* Center Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/70 p-0.5 text-xs shadow-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckSquare className="size-3.5" />
              <span>Canvas Editor</span>
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-all ${
                activeTab === "graph"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="size-3.5" />
              <span>Knowledge Graph</span>
            </button>
            <button
              onClick={() => setActiveTab("split")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-all ${
                activeTab === "split"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns2 className="size-3.5" />
              <span>Split Peek</span>
            </button>
          </div>

          {/* Quick status indicator */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span className="hidden sm:inline">Offline Sync Active</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="relative min-h-[480px] sm:min-h-[440px] flex flex-1 flex-col bg-background/50">
          {/* TAB 1: CANVAS EDITOR */}
          {activeTab === "editor" && (
            <div className="flex flex-1 flex-col p-5 sm:p-8">
              {/* Document Header */}
              <div className="mb-6 flex flex-col gap-2 border-b border-border/40 pb-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                    Workspace / Research
                  </span>
                  <span>•</span>
                  <span>Updated 2 minutes ago</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Building a Second Brain with Yaad
                </h3>
                <p className="text-sm text-muted-foreground">
                  A fast, private notebook where ideas and projects connect
                  naturally.
                </p>
              </div>

              {/* Document Body */}
              <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground">
                <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs sm:text-sm">
                  <Sparkles className="mt-0.5 size-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-primary">
                      Nested Sub-pages:
                    </span>{" "}
                    Contains{" "}
                    <span className="inline-flex cursor-pointer items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/25">
                      📄 Project Ideas
                    </span>{" "}
                    and{" "}
                    <span className="inline-flex cursor-pointer items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/25">
                      📄 Weekly Goals
                    </span>
                    .
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action Items (Click to test interactivity)
                  </span>
                  <div className="space-y-2 pt-1">
                    {todos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleTodo(item.id)}
                        className="group flex w-full items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-2.5 text-left transition-all hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                      >
                        <div
                          className={`flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                            item.done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background group-hover:border-primary/60"
                          }`}
                        >
                          {item.done && <CheckSquare className="size-3.5" />}
                        </div>
                        <span
                          className={`flex-1 text-xs sm:text-sm transition-all ${
                            item.done
                              ? "text-muted-foreground line-through decoration-muted-foreground/60"
                              : "text-foreground font-medium"
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Slash Hint */}
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    /
                  </kbd>
                  <span>
                    Type slash for blocks, headings, code snippets, or backlinks
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE GRAPH */}
          {activeTab === "graph" && (
            <div className="relative flex flex-1 flex-col overflow-hidden p-4">
              <div className="absolute top-4 left-4 z-10 rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs backdrop-blur-md">
                <span className="text-muted-foreground">
                  Interactive Graph • Click any node:
                </span>
              </div>

              {/* Interactive SVG Graph Area */}
              <div className="relative h-[320px] sm:h-[370px] w-full rounded-lg border border-border/30 bg-muted/10">
                <svg
                  className="size-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="edgeGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity="0.8"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                  </defs>

                  {/* Connecting lines */}
                  {GRAPH_NODES.map((source) =>
                    source.connections.map((targetId) => {
                      const target = GRAPH_NODES.find((n) => n.id === targetId);
                      if (!target) return null;
                      const isHighlighted =
                        source.id === activeNode || target.id === activeNode;
                      return (
                        <line
                          key={`${source.id}-${target.id}`}
                          x1={`${source.x}%`}
                          y1={`${source.y}%`}
                          x2={`${target.x}%`}
                          y2={`${target.y}%`}
                          stroke={
                            isHighlighted ? "var(--primary)" : "currentColor"
                          }
                          strokeWidth={isHighlighted ? "0.6" : "0.3"}
                          className={`transition-all duration-300 ${
                            isHighlighted
                              ? "opacity-90"
                              : "text-border opacity-40"
                          }`}
                        />
                      );
                    }),
                  )}
                </svg>

                {/* Node Buttons positioned absolutely */}
                {GRAPH_NODES.map((node) => {
                  const isSelected = node.id === activeNode;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveNode(node.id)}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "scale-110 ring-4 ring-primary/30 z-20"
                          : "hover:scale-105 z-10"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-primary/30"
                            : "border border-border/80 bg-background/90 text-foreground hover:border-primary/50"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            node.category === "core"
                              ? "bg-amber-400"
                              : node.category === "storage"
                                ? "bg-sky-400"
                                : "bg-emerald-400"
                          }`}
                        />
                        <span className="whitespace-nowrap">{node.label}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Node preview card */}
                <div className="absolute right-4 bottom-4 z-20 max-w-xs rounded-xl border border-border/80 bg-card/95 p-3.5 text-left shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">
                      {selectedNode.label}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                      {selectedNode.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedNode.snippet}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPLIT PEEK */}
          {activeTab === "split" && (
            <div className="flex flex-1 overflow-hidden divide-x divide-border/60">
              {/* Left Main Doc */}
              <div className="flex-1 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    System Architecture.md
                  </span>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    Yaad couples a local Rust-powered SQLite database via Tauri
                    with an ultra-reactive React front-end.
                  </p>
                  <div className="rounded-lg border border-border/50 bg-muted/40 p-3 font-mono text-[11px] text-foreground">
                    // Local-first schema
                    <br />
                    SELECT * FROM pages WHERE workspace_id = $1
                    <br />
                    ORDER BY updated_at DESC;
                  </div>
                </div>
              </div>

              {/* Right Side Peek Panel */}
              <div className="w-1/2 bg-muted/20 p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Side Peek: Backlinks
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    3 Links
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-border/50 bg-background/80 p-2.5 text-xs hover:border-primary/40 cursor-pointer">
                    <div className="font-medium text-foreground">
                      Neural Knowledge Graph
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      Referenced in section 2.1 data graph visualizer...
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/80 p-2.5 text-xs hover:border-primary/40 cursor-pointer">
                    <div className="font-medium text-foreground">
                      Tauri Native Runtime
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      Direct IPC bridge for file persistence...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
