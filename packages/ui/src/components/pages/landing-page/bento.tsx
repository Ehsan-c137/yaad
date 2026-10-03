import {
  CheckSquare,
  Columns2,
  Command,
  FileText,
  HardDrive,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Reveal } from "./reveal";

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  title: string;
  description: string;
  color: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: "graph",
    icon: Network,
    title: "Visual knowledge graph",
    description:
      "See how all your notes connect. An interactive graph maps out your workspace automatically — no folders needed.",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    id: "blocks",
    icon: CheckSquare,
    badge: "/",
    title: "Block editor with slash commands",
    description:
      'Type "/" to insert headings, checklists, code blocks, callouts, and nested sub-pages inline.',
    color:
      "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    id: "search",
    icon: Search,
    badge: "⌘K",
    title: "Instant search across all notes",
    description:
      "Find any note, tag, or idea in milliseconds. Works offline, completely indexed on your device.",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400",
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "100% local & private",
    description:
      "Your notes never leave your device. No telemetry, no cloud sync, no tracking. You own your data.",
    color:
      "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    id: "peek",
    icon: Columns2,
    badge: "⌘\\",
    title: "Side-by-side peek panel",
    description:
      "Open linked notes in a side panel to reference while you write — no tab-switching needed.",
    color:
      "text-violet-500 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
  },
];

export function LandingBento() {
  const [activeFeature, setActiveFeature] = useState("graph");

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal animation="t-stagger" className="text-center flex flex-col">
          <div className="t-stagger-line t-stagger-line--1 block">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Features
            </span>
          </div>
          <h2 className="t-stagger-line t-stagger-line--2 mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.15]">
            Everything you need to think clearly.
          </h2>
          <p className="t-stagger-line t-stagger-line--3 mx-auto mt-4 max-w-lg text-[15px] text-neutral-500 dark:text-neutral-400">
            Fast, simple, and completely private. No confusing menus, no
            subscription walls, no waiting on cloud sync.
          </p>
        </Reveal>

        {/* Features layout: left list + right visual */}
        <Reveal
          animation="t-stagger"
          className="mt-16 grid grid-cols-1 items-start gap-10 lg:grid-cols-[380px_1fr]"
          threshold={0.1}
        >
          {/* Left: feature list */}
          <div
            className="space-y-1 t-slide-right"
            style={{ transitionDelay: "100ms" }}
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const isActive = activeFeature === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(f.id)}
                  className={`group flex w-full items-start gap-3.5 rounded-xl p-4 text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-50 dark:bg-neutral-900 shadow-sm"
                      : "hover:bg-neutral-50/60 dark:hover:bg-neutral-900/60"
                  }`}
                >
                  {/* Badge or icon */}
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      f.badge
                        ? "bg-neutral-100 dark:bg-neutral-800 text-foreground dark:text-neutral-200 font-mono"
                        : f.color
                    }`}
                  >
                    {f.badge ? (
                      <span className="text-[11px]">{f.badge}</span>
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-foreground/80 dark:text-foreground/60"
                      }`}
                    >
                      {f.title}
                    </h3>
                    {isActive && (
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 animate-in fade-in slide-in-from-top-1 duration-200">
                        {f.description}
                      </p>
                    )}
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="mt-3 h-0.5 w-full rounded-full bg-gradient-to-r from-primary to-primary/30 animate-in fade-in duration-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: visual preview panel */}
          <div
            className="relative rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-1 shadow-sm t-scale-up-child"
            style={{ transitionDelay: "200ms" }}
          >
            <div className="overflow-hidden rounded-xl border border-neutral-100 dark:border-neutral-800 bg-background">
              {/* Mini window chrome */}
              <div className="flex h-9 items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 px-3">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-[11px] text-neutral-400 dark:text-neutral-500">
                  yaad
                </span>
              </div>

              {/* Feature previews */}
              <div className="min-h-[340px] p-5 sm:p-6">
                {activeFeature === "graph" && <GraphPreview />}
                {activeFeature === "blocks" && <BlocksPreview />}
                {activeFeature === "search" && <SearchPreview />}
                {activeFeature === "privacy" && <PrivacyPreview />}
                {activeFeature === "peek" && <PeekPreview />}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Feature preview mini-components ── */

function GraphPreview() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <Network className="size-3.5 text-blue-500" />
        <span className="font-medium text-foreground">Knowledge Graph</span>
      </div>
      <div className="relative h-[260px] rounded-lg bg-neutral-50/80 dark:bg-neutral-900/80 border border-neutral-100 dark:border-neutral-800">
        <svg className="size-full" viewBox="0 0 400 260" fill="none">
          {/* Connection lines */}
          <line
            x1="200"
            y1="130"
            x2="100"
            y2="60"
            className="stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="130"
            x2="310"
            y2="55"
            className="stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="130"
            x2="90"
            y2="200"
            className="stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="130"
            x2="320"
            y2="195"
            className="stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth="1.5"
          />
          <line
            x1="100"
            y1="60"
            x2="310"
            y2="55"
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth="1"
          />

          {/* Center node */}
          <circle cx="200" cy="130" r="24" fill="#3b82f6" opacity="0.1" />
          <circle cx="200" cy="130" r="14" fill="#3b82f6" />
          <text
            x="200"
            y="134"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
          >
            Core
          </text>

          {/* Satellite nodes */}
          <circle cx="100" cy="60" r="10" fill="#f59e0b" opacity="0.15" />
          <circle
            cx="100"
            cy="60"
            r="10"
            stroke="#f59e0b"
            strokeWidth="1.5"
            className="fill-white dark:fill-zinc-950"
          />
          <circle cx="310" cy="55" r="10" fill="#10b981" opacity="0.15" />
          <circle
            cx="310"
            cy="55"
            r="10"
            stroke="#10b981"
            strokeWidth="1.5"
            className="fill-white dark:fill-zinc-950"
          />
          <circle cx="90" cy="200" r="10" fill="#8b5cf6" opacity="0.15" />
          <circle
            cx="90"
            cy="200"
            r="10"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            className="fill-white dark:fill-zinc-950"
          />
          <circle cx="320" cy="195" r="10" fill="#ef4444" opacity="0.15" />
          <circle
            cx="320"
            cy="195"
            r="10"
            stroke="#ef4444"
            strokeWidth="1.5"
            className="fill-white dark:fill-zinc-950"
          />
        </svg>
        {/* Labels */}
        <div className="absolute top-[38px] left-[130px] rounded bg-white dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-100 dark:border-neutral-800">
          Block Editor
        </div>
        <div className="absolute top-[32px] right-[50px] rounded bg-white dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-100 dark:border-neutral-800">
          Research Notes
        </div>
        <div className="absolute bottom-[40px] left-[120px] rounded bg-white dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-100 dark:border-neutral-800">
          Weekly Goals
        </div>
        <div className="absolute bottom-[46px] right-[40px] rounded bg-white dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-100 dark:border-neutral-800">
          Reading List
        </div>
      </div>
    </div>
  );
}

function BlocksPreview() {
  return (
    <div className="animate-in fade-in duration-300 space-y-3">
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <FileText className="size-3.5 text-amber-500" />
        <span className="font-medium text-foreground">Block Canvas</span>
        <span className="ml-auto rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
          /
        </span>
      </div>
      {/* Fake editor blocks */}
      <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 bg-background p-4 space-y-3">
        <div className="text-lg font-bold text-foreground">Project Roadmap</div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          A plan for the next quarter, broken into milestones and tasks.
        </p>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-xs">
            <div className="size-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
              <CheckSquare className="size-3 text-white" />
            </div>
            <span className="line-through text-neutral-400 dark:text-emerald-900/50">
              Set up project workspace
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs">
            <div className="size-4 rounded border-2 border-neutral-300 dark:border-neutral-700" />
            <span className="text-foreground font-medium">
              Draft architecture diagram
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs">
            <div className="size-4 rounded border-2 border-neutral-300 dark:border-neutral-700" />
            <span className="text-foreground font-medium">
              Write API specifications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPreview() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <Search className="size-3.5 text-sky-500" />
        <span className="font-medium text-foreground">Quick Search</span>
        <div className="ml-auto flex items-center gap-0.5 rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
          <Command className="size-2.5" />K
        </div>
      </div>
      {/* Search mockup */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
          <Search className="size-4 text-neutral-400" />
          <span className="text-sm text-foreground">project ideas...</span>
          <span className="ml-auto text-[10px] text-neutral-400">
            3 results
          </span>
        </div>
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 cursor-pointer">
            <FileText className="size-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground truncate">
                Project Ideas for Q4
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                Updated 2 hours ago
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <FileText className="size-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground truncate">
                Side Project Brainstorm
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                Updated yesterday
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <FileText className="size-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-foreground truncate">
                Idea Garden — Long Term
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                Updated 3 days ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyPreview() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <ShieldCheck className="size-3.5 text-emerald-500" />
        <span className="font-medium text-foreground">Local-First Privacy</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-6 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100/60 dark:bg-emerald-500/20">
          <HardDrive className="size-7 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h4 className="mt-4 text-sm font-bold text-foreground">
          Your device, your data.
        </h4>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          All notes are stored directly on your computer. No cloud servers, no
          telemetry, no tracking. Export or back up anytime.
        </p>
        <div className="mt-6 flex items-center gap-4 text-[11px] text-neutral-400 dark:text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Zero tracking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            No accounts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Full export
          </span>
        </div>
      </div>
    </div>
  );
}

function PeekPreview() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <Columns2 className="size-3.5 text-violet-500" />
        <span className="font-medium text-foreground">Split Peek</span>
        <span className="ml-auto rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
          ⌘\
        </span>
      </div>
      <div className="flex gap-0.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
        {/* Left pane */}
        <div className="flex-1 bg-background p-4">
          <div className="text-xs font-semibold text-foreground mb-2">
            Architecture.md
          </div>
          <div className="space-y-2 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            <p>Yaad uses a local Rust-powered SQLite database via Tauri.</p>
            <div className="rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-2 font-mono text-[10px] text-foreground">
              SELECT * FROM pages
              <br />
              WHERE workspace_id = $1
              <br />
              ORDER BY updated_at DESC;
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="w-px bg-neutral-200 dark:bg-neutral-800" />
        {/* Right pane */}
        <div className="w-2/5 bg-neutral-50/80 dark:bg-neutral-900/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-foreground">
              Backlinks
            </span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              3
            </span>
          </div>
          <div className="space-y-2">
            <div className="rounded-md border border-neutral-100 dark:border-neutral-800 bg-background px-2.5 py-2 text-[10px] font-medium text-foreground cursor-pointer hover:border-primary/30 transition-colors">
              Knowledge Graph
            </div>
            <div className="rounded-md border border-neutral-100 dark:border-neutral-800 bg-background px-2.5 py-2 text-[10px] font-medium text-foreground cursor-pointer hover:border-primary/30 transition-colors">
              Tauri Runtime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
