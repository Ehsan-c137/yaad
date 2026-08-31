"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { ROUTES } from "@/constants/routes";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function HomePage() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const router = useRouter();

  const handleNavigation = useCallback(
    (activeWorkspace: string) => {
      router.replace(`${ROUTES.workspace}/${activeWorkspace}`);
    },
    [router],
  );

  useEffect(() => {
    if (!activeWorkspaceId) return;
    handleNavigation(activeWorkspaceId);
  }, [activeWorkspaceId, handleNavigation]);

  if (!activeWorkspaceId)
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">
        <main className="fade-in-up flex w-full max-w-lg flex-col items-center gap-8 py-24 text-center">
          <div
            className={[
              "transition-transform duration--spring-duration",
              "ease--spring hover:scale-[1.03]",
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
          <p>Ooops. no active workspace found </p>
        </main>
      </div>
    );

  return <LoadingSkeleton />;
}

function LoadingSkeleton() {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-10 w-full shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-2">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <div className={cn(styles.skeleton, "size-6 rounded-md")} />
          <div className="mx-0.5 h-4 w-px bg-border/60" />
          <div className={cn(styles.skeleton, "h-6 w-28 rounded-md")} />
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(styles.skeleton, "size-6 rounded-md")} />
          <div className={cn(styles.skeleton, "size-6 rounded-md")} />
        </div>
      </header>

      <main className="flex-1 scroll-fade space-y-6 overflow-y-auto p-8">
        <div className="max-w-3xl space-y-4">
          <div className={cn(styles.skeleton, "size-12 rounded-xl")} />

          <div className={cn(styles.skeleton, "h-8 w-2/5 rounded-lg")} />

          <div className="space-y-2 pt-4">
            <div className={cn(styles.skeleton, "h-4 w-full rounded-md")} />
            <div className={cn(styles.skeleton, "h-4 w-5/6 rounded-md")} />
            <div className={cn(styles.skeleton, "h-4 w-4/6 rounded-md")} />
          </div>
        </div>
      </main>
    </div>
  );
}
