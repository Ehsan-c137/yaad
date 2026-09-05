"use client";

import { Button } from "@ui/button";
import { ExternalLink, Info } from "lucide-react";

import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function AboutSection() {
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>About</p>

      <SettingsRow
        icon={<Info className="size-3.5" strokeWidth={1.5} />}
        title="Yaad"
        subtitle="A calm space for your notes — v0.1"
      />

      {/* <SettingsRow
        icon={<GithubIcon className="size-3.5" />}
        title="Want to contribute?"
        subtitle="Help build Yaad on GitHub"
        control={
          <Button
            variant="outline"
            size="xs"
            nativeButton={false}
            render={
              <a
                aria-label="Visit Yaad GitHub repository"
                href="https://github.com/Ehsan-c137/yaad"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Contribute
            <ExternalLink className="ml-1 size-3" />
          </Button>
        }
      /> */}
    </>
  );
}
