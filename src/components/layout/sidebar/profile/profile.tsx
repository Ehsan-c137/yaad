"use client";

import { Avatar, AvatarFallback } from "@ui/avatar";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Separator } from "@ui/separator";
import { Pencil, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { useUserStore } from "@/store/use-user-store";

const SettingsModal = dynamic(() =>
  import("../setting/settings-modal").then((mod) => mod.SettingsModal),
);

export function Profile() {
  const userName = useUserStore((state) => state.userName);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const displayName = userName ? `${userName}'s Yaad` : "My Yaad";
  const initial = (userName?.trim().charAt(0) ?? "Y").toUpperCase();

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="size-auto w-full flex-1 justify-start gap-2 rounded-full px-2 py-2.5"
              aria-label="Open profile menu"
            />
          }
        >
          <Avatar className="size-7">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{displayName}</span>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="top"
          className="flex flex-col gap-1 p-2"
        >
          <div className="flex items-center gap-2 px-1 py-0.5">
            <Avatar className="size-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm font-medium">{displayName}</p>
            </div>
          </div>

          <Separator />

          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditNameOpen(true);
            }}
          >
            <Pencil strokeWidth={1.5} className="size-4" />
            Edit name
          </Button>

          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSettingsOpen(true);
            }}
          >
            <Settings strokeWidth={1.5} className="size-4" />
            Settings
          </Button>
        </PopoverContent>
      </Popover>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <WelcomeModal open={isEditNameOpen} onOpenChange={setIsEditNameOpen} />
    </>
  );
}
