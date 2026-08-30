"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function HomePage() {
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspace = useWorkspaceStore(
    (state) => state.setActiveWorkspace,
  );
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const router = useRouter();

  if (!activeWorkspaceId) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">
      <main className="fade-in-up flex w-full max-w-lg flex-col items-center gap-8 py-24 text-center">
        <div
          className={[
            "transition-transform duration-[var(--spring-duration)]",
            "ease-[var(--spring)] hover:scale-[1.03]",
          ].join(" ")}
        >
          <Image
            src="/brazuca-sitting.png"
            alt="Illustrated character sitting calmly"
            width={200}
            height={320}
            unoptimized
            className="drop-shadow-sm"
          />
        </div>

        <section aria-label="Choose your workspace" className="w-full">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Choose your workspace
          </p>

          <div
            role="listbox"
            aria-label="Workspaces"
            className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto"
          >
            {Object.values(workspaces).map((ws) => {
              const isActive = ws.id === activeWorkspaceId;

              return (
                <button
                  key={ws.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                    "transition-colors duration-(--press-duration) ease-(--spring)",
                    isActive
                      ? "bg-(--accent-blue-tint)"
                      : "hover:bg-foreground/5",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--accent-blue-subtle) text-lg leading-none"
                  >
                    {ws.icon}
                  </span>

                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm font-medium",
                      isActive ? "text-(--accent-blue)" : "text-foreground",
                    )}
                  >
                    {ws.name}
                  </span>

                  {isActive && (
                    <span
                      aria-label="Active"
                      className="flex shrink-0 items-center gap-1 rounded-full bg-(--accent-blue) px-2 py-0.5 text-xs font-medium text-white shadow-sm"
                    >
                      <Check className="size-3" />
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <Button
          size="pill"
          onClick={() => {
            const pageId = createPage(null);
            router.push(`/${ROUTES.workspace}/${activeWorkspaceId}/${pageId}`);
          }}
        >
          <Plus className="size-4" />
          New Page
        </Button>
      </main>
    </div>
  );
}
