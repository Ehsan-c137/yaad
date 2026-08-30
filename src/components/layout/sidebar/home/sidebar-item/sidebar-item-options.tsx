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
import { Ellipsis } from "lucide-react";
import { useState } from "react";

import { useDeletePage } from "@/hooks/sidebar/use-delete-page";
import { useMediaQuery } from "@/hooks/use-media-query";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

import { SidebarActions } from "./sidebar-item-actions";

interface SidebarItemOptionsProps {
  pageId: string;
}

export function SidebarItemOptions({ pageId }: SidebarItemOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const page = useSidebarStore((s) => s.pages[pageId]);
  const handleDeletePage = useDeletePage(pageId);

  if (!page) return null;

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
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{page.title || "Untitled"}
              &quot;? This will also delete any sub-pages it contains.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeletePage}>
              Delete
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
        className={cn(
          styles.menu,
          "w-56 p-1.5 text-xs shadow-xl backdrop-blur-xl",
        )}
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
    <button
      type="button"
      onClick={onClick}
      title="Page options"
      aria-label="Page options"
      className={cn(
        "relative flex size-5 items-center justify-center rounded-sm",
        "text-muted-foreground transition-colors",
        "hover:bg-foreground/8 hover:text-foreground",
        /* 44px transparent touch target */
        "after:absolute after:-inset-3 after:content-['']",
      )}
    >
      <Ellipsis className="size-3.5" />
    </button>
  );
}
