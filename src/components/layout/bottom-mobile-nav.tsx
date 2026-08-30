"use client";

import { Button } from "@ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { SearchBox } from "@/components/search/search-command";
import { ROUTES } from "@/constants/routes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function BottomMobileNav() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId);

  if (!isMobile || !activeWorkspace) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "toolbar",
        "fixed bottom-0 left-0 z-40 flex w-full items-center justify-between",
        "border-t border-border/40 px-4 py-2",
        "safe-area-pb",
      )}
    >
      <SearchBox />
      <Button
        size="icon-lg"
        onClick={() => {
          const pageId = createPage(null);
          router.push(`/${ROUTES.workspace}/${activeWorkspace}/${pageId}`);
        }}
      >
        <Plus />
      </Button>
    </nav>
  );
}
