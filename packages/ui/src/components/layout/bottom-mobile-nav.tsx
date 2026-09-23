import { Button } from "@ui/button";
import { ROUTES } from "@yaad/core/constants/routes";
import { MOBILE_NAV_HEIGHT } from "@yaad/core/constants/sizes";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

import { SearchBox } from "@/components/search/search-command";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function BottomMobileNav() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const createPage = useSidebarStore((store) => store.createPage);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId);

  if (!isMobile || !activeWorkspace) return null;

  return (
    <nav
      style={{ height: `${MOBILE_NAV_HEIGHT}px` }}
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-0 left-0 z-40 flex w-full items-center justify-between bg-background",
        "border-t border-border/40 px-4 py-2",
        "safe-area-pb",
      )}
    >
      <SearchBox />
      <Button
        size="icon-lg"
        onClick={() => {
          const pageId = createPage(null);
          navigate(`/${ROUTES.workspace}/${activeWorkspace}/${pageId}`);
        }}
      >
        <Plus />
      </Button>
    </nav>
  );
}
