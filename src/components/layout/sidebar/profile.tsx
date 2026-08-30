import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Separator } from "@ui/separator";
import { Settings } from "lucide-react";

import { useSidebarStore } from "@/store/use-sidebar-store";

export function Profile() {
  const toggleSidebar = useSidebarStore((store) => store.toggleSidebar);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className="flex w-full justify-between rounded-full px-2 py-5"
            aria-label="Open profile menu"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">Ehsan's Yaad</span>
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-1 p-2">
        <div className="flex items-center gap-2 px-1 py-0.5">
          <Avatar className="size-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium">Ehsan's Yaad</p>
          </div>
        </div>

        <Separator />

        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2"
          onClick={toggleSidebar}
        >
          <Settings strokeWidth={1.5} className="size-4" />
          Settings
        </Button>
      </PopoverContent>
    </Popover>
  );
}
