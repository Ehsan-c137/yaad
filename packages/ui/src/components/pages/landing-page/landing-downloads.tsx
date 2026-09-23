import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import {
  Check,
  Copy,
  Download,
  Globe,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { AppleIcon, LinuxIcon, WindowsIcon } from "./landing-platform-utils";

export function LandingDownloads() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<"linux" | "mac" | "win">("mac");

  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/workspace/ws_personal";

  const copyInstallCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const getCliCommand = () => {
    switch (activeTab) {
      case "mac":
        return "brew install --cask yaad";

      case "win":
        return "winget install yaad";

      case "linux":
        return "curl -fsSL https://get.yaad.app | sh";
    }
  };

  return (
    <section id="downloads" className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Download className="size-3.5" />
            <span>Available Everywhere</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Download Yaad for your computer.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Lightweight, battery-friendly, and opens in milliseconds. Download
            the desktop app or launch directly in your browser.
          </p>
        </div>

        {/* 4 Platform Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* macOS Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
                  <AppleIcon className="size-6" />
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  macOS 11+
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">macOS</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Optimized for Apple Silicon (M1/M2/M3/M4) and Intel Macs.
              </p>

              {/* Download Buttons for Mac */}
              <div className="mt-6 space-y-2">
                <a
                  href="#download-mac-arm"
                  className="flex w-full items-center justify-between rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Download className="size-4" />
                    <span>Apple Silicon (.dmg)</span>
                  </div>
                  <span className="text-[10px] opacity-80">68 MB</span>
                </a>

                <a
                  href="#download-mac-intel"
                  className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-muted/40"
                >
                  <span>Intel Mac (.dmg)</span>
                  <span className="text-[10px] text-muted-foreground">
                    72 MB
                  </span>
                </a>
              </div>
            </div>

            <div className="mt-6 border-t border-border/40 pt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>Verified & Secure for Mac</span>
            </div>
          </div>

          {/* Windows Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <WindowsIcon className="size-6" />
                </div>
                <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  Win 10/11
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                Windows
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Easy installer for Windows 10 and 11. Quick setup in a few
                clicks.
              </p>

              {/* Download Buttons for Windows */}
              <div className="mt-6 space-y-2">
                <a
                  href="#download-win-exe"
                  className="flex w-full items-center justify-between rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Download className="size-4" />
                    <span>Installer (.exe)</span>
                  </div>
                  <span className="text-[10px] opacity-80">64 MB</span>
                </a>

                <a
                  href="#download-win-msi"
                  className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-muted/40"
                >
                  <span>Enterprise MSI (.msi)</span>
                  <span className="text-[10px] text-muted-foreground">
                    65 MB
                  </span>
                </a>
              </div>
            </div>

            <div className="mt-6 border-t border-border/40 pt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>Verified & Secure for Windows</span>
            </div>
          </div>

          {/* Linux Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <LinuxIcon className="size-6" />
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  All Distros
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">Linux</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                AppImage and .deb packages ready to run on any Linux
                distribution.
              </p>

              {/* Download Buttons for Linux */}
              <div className="mt-6 space-y-2">
                <a
                  href="#download-linux-appimage"
                  className="flex w-full items-center justify-between rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Download className="size-4" />
                    <span>AppImage (.AppImage)</span>
                  </div>
                  <span className="text-[10px] opacity-80">75 MB</span>
                </a>

                <a
                  href="#download-linux-deb"
                  className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-muted/40"
                >
                  <span>Debian / Ubuntu (.deb)</span>
                  <span className="text-[10px] text-muted-foreground">
                    62 MB
                  </span>
                </a>
              </div>
            </div>

            <div className="mt-6 border-t border-border/40 pt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>Verified Linux Package</span>
            </div>
          </div>

          {/* Web App Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/5 via-card/70 to-card/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-primary/60 hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe className="size-6" />
                </div>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                  No Install
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                Web App
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Use Yaad directly in your web browser. All data stays saved
                privately on your device.
              </p>

              {/* Action Button for Web */}
              <div className="mt-6 space-y-2">
                <Link
                  to={targetWorkspaceHref}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="size-4" />
                  <span>Launch Yaad Web</span>
                </Link>

                <div className="rounded-xl border border-border/60 bg-background/50 p-2.5 text-center text-[11px] text-muted-foreground">
                  Works on Chrome, Safari, Firefox, Edge
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border/40 pt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>No installation required</span>
            </div>
          </div>
        </div>

        {/* CLI / Package Manager Quick Install */}
        <div className="mt-12 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Terminal className="size-4 text-primary" />
                <span>Command Line Install (Optional)</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Prefer package managers? Install Yaad with a single terminal
                command.
              </p>
            </div>

            {/* Platform tab selector */}
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("mac")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  activeTab === "mac"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Homebrew
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("win")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  activeTab === "win"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                WinGet
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("linux")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  activeTab === "linux"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Shell Script
              </button>
            </div>
          </div>

          {/* Code Bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-4 py-3 font-mono text-xs sm:text-sm">
            <span className="text-foreground select-all">
              {getCliCommand()}
            </span>
            <button
              type="button"
              onClick={() => copyInstallCommand(getCliCommand())}
              className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-sans text-muted-foreground transition-all hover:text-foreground cursor-pointer"
            >
              {copiedCmd ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
