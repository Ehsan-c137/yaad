import {
  ArrowUpRight,
  CheckSquare,
  Columns2,
  Command,
  CornerDownRight,
  FileText,
  HardDrive,
  Network,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function LandingBento() {
  return (
    <section id="features" className="py-10 sm:py-18 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="size-3.5 text-primary" />
            <span>Key Features</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Everything you need to write and think clearly.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Designed to be fast, simple, and completely private. No confusing
            menus, no subscription walls, and no waiting on cloud sync.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Knowledge Graph & Nested Pages (Col Span 2 on large) */}
          <div className="group relative col-span-1 overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Network className="size-5" />
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Nested Pages & Graph
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                Structure Freely, Visualize as a Graph
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your ideas don't have to live in separate, forgotten folders.
                Nest sub-pages infinitely with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  /page
                </code>
                , organize thoughts hierarchically, and watch an interactive
                knowledge graph map out your entire workspace automatically.
              </p>
            </div>

            {/* Visual nested sub-page & graph mockup snippet */}
            <div className="mt-6 space-y-2 rounded-xl border border-border/50 bg-background/80 p-3.5 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/70 px-3 py-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <FileText className="size-4 text-primary" />
                  <span>Project Workspace</span>
                </div>
                <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Parent Doc
                </span>
              </div>

              <div className="ml-3 sm:ml-5 flex items-center justify-between rounded-lg border border-border/30 bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-foreground">
                  <CornerDownRight className="size-3.5 text-muted-foreground shrink-0" />
                  <FileText className="size-3.5 text-primary/80 shrink-0" />
                  <span className="font-medium truncate">
                    Reading Notes & Research
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    /page
                  </span>
                  <ArrowUpRight className="size-3 text-muted-foreground" />
                </div>
              </div>

              <div className="ml-3 sm:ml-5 flex items-center justify-between rounded-lg border border-border/30 bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-foreground">
                  <CornerDownRight className="size-3.5 text-muted-foreground shrink-0" />
                  <FileText className="size-3.5 text-primary/80 shrink-0" />
                  <span className="font-medium truncate">
                    Weekly Goals & Milestones
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    /page
                  </span>
                  <ArrowUpRight className="size-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Zen Block Canvas */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <CheckSquare className="size-5" />
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Block Editor
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground">
                Flexible Block Canvas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Write freely with intuitive blocks. Type{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  /
                </code>{" "}
                for headings, sub-pages, checklists, kanban boards, and code
                blocks.
              </p>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-border/50 bg-background/80 p-3 text-xs">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Easily rearrange and reorder blocks</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                <span>Turn blocks into to-dos, quotes, or callouts</span>
              </div>
            </div>
          </div>

          {/* Card 3: 0ms Spotlight Search */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <Search className="size-5" />
              </div>
              <div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                <Command className="size-3" />
                <span>K</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground">
                Instant Search
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hit{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                  ⌘K
                </kbd>{" "}
                (or Ctrl+K) anywhere to search through all your notes, tags, and
                topics in a flash.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-border/50 bg-background/80 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Search className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  project ideas...
                </span>
              </div>
              <div className="pt-2 text-[11px] text-muted-foreground">
                3 notes found instantly
              </div>
            </div>
          </div>

          {/* Card 4: Local-First Privacy */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="size-5" />
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                100% Private
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground">
                Your Data Stays on Your Device
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your thoughts belong only to you. Notes are saved directly to
                your computer. No telemetry, no tracking, and no risk of cloud
                outages.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/50 bg-background/80 p-3 text-xs text-muted-foreground">
              <HardDrive className="size-4 text-emerald-500 shrink-0" />
              <span>Read, back up, or export your notes anytime</span>
            </div>
          </div>

          {/* Card 5: Spatial Peek Panel */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Columns2 className="size-5" />
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Side-by-Side
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground">
                Read and Write Side by Side
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Open connected notes in a side panel so you can reference
                research or meeting takeaways without losing your active
                paragraph.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-border/50 bg-background/80 p-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Side Peek Active
                </span>
                <span className="text-[10px] text-primary font-mono">⌘\</span>
              </div>
              <p className="mt-1 text-[11px]">
                Check references side-by-side without opening dozens of tabs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
