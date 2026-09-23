"use client";

import { styles } from "@yaad/core/lib/design-token";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AboutSection() {
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>About</p>

      <SettingsRow
        icon={<Info className="size-3.5" strokeWidth={1.5} />}
        title="Yaad"
        subtitle="A calm space for your notes â€” v0.1"
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
