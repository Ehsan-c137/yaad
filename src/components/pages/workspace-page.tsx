"use client";

import type { Workspace } from "@/types/workspace";

import { RecentDocsList } from "@/components/pages/recent-docs-list/recent-docs-list";

interface WorkspaceHomePageProps {
  workspace: Workspace;
}

export function WorkspaceHomePage({ workspace }: WorkspaceHomePageProps) {
  return (
    <div className="mx-auto max-w-4xl px-12 py-16">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-4xl">{workspace.icon}</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Select a page from the sidebar or press{" "}
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>{" "}
        /{" "}
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          Ctrl+K
        </kbd>{" "}
        to search.
      </p>
      <RecentDocsList workspaceId={workspace.id} />
    </div>
  );
}
