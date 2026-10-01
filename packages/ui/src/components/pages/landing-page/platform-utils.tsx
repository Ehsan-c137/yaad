import type { SVGProps } from "react";

export type PlatformType = "linux" | "macos" | "web" | "windows";

export function detectUserPlatform(): PlatformType {
  if (typeof window === "undefined" || !window.navigator) {
    return "macos";
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform =
    (
      window.navigator as unknown as { userAgentData?: { platform?: string } }
    )?.userAgentData?.platform?.toLowerCase() ||
    window.navigator.platform?.toLowerCase() ||
    "";

  if (
    platform.includes("mac") ||
    userAgent.includes("macintosh") ||
    userAgent.includes("mac os")
  ) {
    return "macos";
  }
  if (platform.includes("win") || userAgent.includes("windows")) {
    return "windows";
  }
  if (
    platform.includes("linux") ||
    userAgent.includes("linux") ||
    userAgent.includes("x11")
  ) {
    return "linux";
  }

  return "web";
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      {...props}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.16c.61-.74 1.03-1.77.92-2.8-.89.04-1.99.6-2.63 1.34-.56.64-1.05 1.68-.92 2.69.99.08 2.02-.49 2.63-1.23z" />
    </svg>
  );
}

export function WindowsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      {...props}
    >
      <path d="M3 5.46L10.39 4.45V11.23H3V5.46M3 12.77H10.39V19.55L3 18.54V12.77M11.61 4.28L21 3V11.23H11.61V4.28M11.61 12.77H21V21L11.61 19.72V12.77Z" />
    </svg>
  );
}

export function LinuxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      {...props}
    >
      <path d="M12 2A4 4 0 0 0 8 6v4.09c-.64.44-1.09 1.1-1.29 1.91-.71.55-1.21 1.35-1.21 2.5 0 2.49 2.5 4.5 5.5 4.5h2c3 0 5.5-2.01 5.5-4.5 0-1.15-.5-1.95-1.21-2.5-.2-.81-.65-1.47-1.29-1.91V6a4 4 0 0 0-4-4zm-1.5 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-1.5 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-6 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm12 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
    </svg>
  );
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export interface ReleaseAsset {
  label: string;
  filename: string;
  arch: string;
  type: string;
  href: string;
  size: string;
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  osName: string;
  badge: string;
  defaultFile: string;
  primaryArch: string;
  icon: typeof AppleIcon;
  assets: ReleaseAsset[];
}

export const PLATFORMS_DATA: Record<PlatformType, PlatformConfig> = {
  macos: {
    id: "macos",
    name: "macOS",
    osName: "macOS 11+",
    badge: "Universal DMG",
    defaultFile: "Yaad-2.0.0-aarch64.dmg",
    primaryArch: "Apple Silicon & Intel",
    icon: AppleIcon,
    assets: [
      {
        label: "Apple Silicon (M1/M2/M3/M4)",
        filename: "Yaad-2.0.0-aarch64.dmg",
        arch: "arm64",
        type: ".dmg installer",
        href: "#download-mac-arm64",
        size: "68 MB",
      },
      {
        label: "Intel Mac",
        filename: "Yaad-2.0.0-x64.dmg",
        arch: "x64",
        type: ".dmg installer",
        href: "#download-mac-x64",
        size: "72 MB",
      },
    ],
  },
  windows: {
    id: "windows",
    name: "Windows",
    osName: "Windows 10/11",
    badge: "Installer & Portable",
    defaultFile: "Yaad-Setup-2.0.0.exe",
    primaryArch: "x64 & ARM64",
    icon: WindowsIcon,
    assets: [
      {
        label: "Windows 64-bit Installer",
        filename: "Yaad-Setup-2.0.0.exe",
        arch: "x64",
        type: ".exe installer",
        href: "#download-win-exe",
        size: "64 MB",
      },
      {
        label: "Windows MSI Package",
        filename: "Yaad-2.0.0-x64.msi",
        arch: "x64",
        type: ".msi package",
        href: "#download-win-msi",
        size: "65 MB",
      },
    ],
  },
  linux: {
    id: "linux",
    name: "Linux",
    osName: "Linux (All distros)",
    badge: "AppImage & Deb",
    defaultFile: "Yaad-2.0.0.AppImage",
    primaryArch: "x86_64",
    icon: LinuxIcon,
    assets: [
      {
        label: "Universal AppImage",
        filename: "Yaad-2.0.0.AppImage",
        arch: "x86_64",
        type: "Standalone binary",
        href: "#download-linux-appimage",
        size: "75 MB",
      },
      {
        label: "Debian / Ubuntu (.deb)",
        filename: "yaad_2.0.0_amd64.deb",
        arch: "amd64",
        type: "APT package",
        href: "#download-linux-deb",
        size: "62 MB",
      },
    ],
  },
  web: {
    id: "web",
    name: "Web App",
    osName: "Any modern browser",
    badge: "Zero Install",
    defaultFile: "Instant Browser Access",
    primaryArch: "Chrome, Safari, Firefox, Edge",
    icon: AppleIcon, // will use globe in UI
    assets: [
      {
        label: "Launch Web App",
        filename: "Local-First IndexedDB",
        arch: "Web",
        type: "Instant Access",
        href: "/workspace/ws_personal",
        size: "Instant",
      },
    ],
  },
};
