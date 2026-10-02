import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import pkg from "@/../package.json";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";

import { SettingsRow } from "../settings-row";

export function AboutSection() {
  const { t } = useTranslation(["settings", "common"]);
  console.log(pkg);
  return (
    <>
      <p className={cn(styles.sectionLabel, "px-5 pt-3 pb-1")}>
        {t("settings:about")}
      </p>

      <SettingsRow
        icon={<Info className="size-3.5" strokeWidth={1.5} />}
        title={t("common:appName")}
        subtitle={t("settings:aboutSubtitle", { version: pkg.version })}
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
