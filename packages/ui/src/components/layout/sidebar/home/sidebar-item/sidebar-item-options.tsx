"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { ROUTES } from "@yaad/core/constants/routes";
import { styles } from "@yaad/core/lib/design-token";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { SidebarActions } from "./sidebar-item-actions";

interface SidebarItemOptionsProps {
  pageId: string;
}

export function SidebarItemOptions({ pageId }: SidebarItemOptionsProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const page = useSidebarStore((s) => s.pages[pageId]);
  const moveToTrash = useSidebarStore((s) => s.moveToTrash);
  const restorePage = useSidebarStore((s) => s.restorePage);
  const activePageId = useSidebarStore((s) => s.activePageId);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  if (!page) return null;

  const handleMoveToTrash = () => {
    setIsDeleteDialogOpen(false);
    setIsOpen(false);
    const pageTitle = page.title || "Untitled";

    moveToTrash(pageId);

    toast.success(`Moved "${pageTitle}" to trash`, {
      action: {
        label: "Undo",
        onClick: () => {
          restorePage(pageId);
          toast.success(`Restored "${pageTitle}"`);
        },
      },
    });

    if (activePageId === pageId && activeWorkspaceId) {
      navigate(`/${ROUTES.workspace}/${activeWorkspaceId}`);
    }
  };

  const sharedActionsProps = {
    page,
    setIsOpen,
    setIsDeleteDialogOpen,
  };

  return (
    <>
      <OptionsMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sharedActionsProps={sharedActionsProps}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{page.title || "Untitled"}&quot; and any sub-pages it
              contains will be moved to the trash. You can restore them anytime
              from Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleMoveToTrash}
            >
              Move to trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function OptionsMenu({
  isOpen,
  setIsOpen,
  sharedActionsProps,
}: Record<string, any>) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev: boolean) => !prev);
  };

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
        swipeDirection="down"
        showSwipeHandle
      >
        <DrawerTrigger
          onClick={(e) => e.stopPropagation()}
          render={<OptionsButton onClick={handleTriggerClick} />}
        />
        <DrawerContent className="p-3" aria-labelledby="page-options-title">
          <DrawerHeader className="p-0 pb-2">
            <DrawerTitle
              id="page-options-title"
              className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Page Options
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 pb-4">
            <SidebarActions {...sharedActionsProps} isMobile />
          </div>
          <DrawerClose
            render={
              <Button variant="outline" className="w-full">
                Close
              </Button>
            }
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        onClick={(e) => e.stopPropagation()}
        render={<OptionsButton onClick={handleTriggerClick} />}
      />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className={cn(styles.menu, "w-56 p-1.5 text-xs shadow-xl")}
      >
        <SidebarActions {...sharedActionsProps} />
      </PopoverContent>
    </Popover>
  );
}

function OptionsButton({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <Button
      onClick={onClick}
      title="Page options"
      aria-label="Page options"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "relative flex size-5 items-center justify-center rounded-sm",
        "text-muted-foreground transition-colors",
        "hover:bg-foreground/8 hover:text-foreground",
        /* 44px transparent touch target */
        "after:absolute after:-inset-3 after:content-['']",
      )}
    >
      <Ellipsis className="size-3.5" />
    </Button>
  );
}
