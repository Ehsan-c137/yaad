import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";
import { Download, Globe, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

import { AppleIcon, LinuxIcon, WindowsIcon } from "./platform-utils";

export function LandingDownloads() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const targetWorkspaceHref = activeWorkspaceId
    ? `/workspace/${activeWorkspaceId}`
    : "/workspace/ws_personal";

  const platforms = [
    {
      id: "macos",
      name: "macOS",
      icon: AppleIcon,
      badge: "macOS 11+",
      desc: "Optimized for Apple Silicon (M1/M2/M3/M4) and Intel Macs.",
      primary: { label: "Apple Silicon (.dmg)", size: "68 MB" },
      secondary: { label: "Intel Mac (.dmg)", size: "72 MB" },
      comingSoon: true,
    },
    {
      id: "windows",
      name: "Windows",
      icon: WindowsIcon,
      badge: "Win 10/11",
      desc: "Easy installer for Windows 10 and 11. Quick setup in a few clicks.",
      primary: { label: "Installer (.exe)", size: "64 MB" },
      secondary: { label: "Enterprise MSI (.msi)", size: "65 MB" },
      comingSoon: true,
    },
    {
      id: "linux",
      name: "Linux",
      icon: LinuxIcon,
      badge: "All Distros",
      desc: "AppImage and .deb packages ready to run on any Linux distribution.",
      primary: { label: "AppImage (.AppImage)", size: "75 MB" },
      secondary: { label: "Debian (.deb)", size: "62 MB" },
      comingSoon: true,
    },
  ];

  return (
    <section id="downloads" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
            Downloads
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.15]">
            Get Yaad for your computer.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-neutral-500">
            Lightweight, battery-friendly, and opens in milliseconds. Download
            the desktop app or launch directly in your browser.
          </p>
        </div>

        {/* Platform cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-neutral-100 bg-white p-5 transition-all hover:border-neutral-200 hover:shadow-sm"
              >
                {platform.comingSoon && (
                  <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                    <p className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-500">
                      Coming soon
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600">
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                      {platform.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-foreground">
                    {platform.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {platform.desc}
                  </p>

                  <div className="mt-5 space-y-2">
                    <a
                      href={`#download-${platform.id}`}
                      className="flex w-full items-center justify-between rounded-xl bg-foreground px-3.5 py-2.5 text-xs font-semibold text-background transition-all hover:bg-foreground/85 active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="size-3.5" />
                        <span>{platform.primary.label}</span>
                      </div>
                      <span className="text-[10px] opacity-60">
                        {platform.primary.size}
                      </span>
                    </a>
                    <a
                      href={`#download-${platform.id}-alt`}
                      className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:bg-neutral-100"
                    >
                      <span>{platform.secondary.label}</span>
                      <span className="text-[10px] text-neutral-400">
                        {platform.secondary.size}
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Verified & Secure</span>
                </div>
              </div>
            );
          })}

          {/* Web App Card — highlighted */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5 transition-all hover:border-foreground/15 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe className="size-5" />
                </div>
                <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-bold text-background">
                  No Install
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                Web App
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Use Yaad directly in your web browser. All data stays saved
                privately on your device.
              </p>

              <div className="mt-5 space-y-2">
                <Link
                  to={targetWorkspaceHref}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3.5 py-2.5 text-xs font-semibold text-background transition-all hover:bg-foreground/85 active:scale-[0.97] cursor-pointer"
                >
                  Launch Yaad Web
                </Link>
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2 text-center text-[10px] text-neutral-400">
                  Chrome, Safari, Firefox, Edge
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>No installation required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
