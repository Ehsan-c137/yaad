"use client";

import { useEffect, useState } from "react";

import type { DevicePerformanceInfo } from "@/lib/device-performance";

import { getDevicePerformanceInfo } from "@/lib/device-performance";

import { useLocalStorage } from "./use-local-storage";

export type TransitionPreference = "auto" | "disabled" | "enabled";

export interface PageTransitionPreferenceResult {
  deviceInfo: DevicePerformanceInfo;
  isLowDevice: boolean;
  preference: TransitionPreference;
  setPreference: (preference: TransitionPreference) => void;
  transitionsEnabled: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: {
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
  };
};

export function usePageTransitionPreference(): PageTransitionPreferenceResult {
  const [preference, setPreference] = useLocalStorage<TransitionPreference>(
    "page-transition-preference",
    "auto",
  );

  const [deviceInfo, setDeviceInfo] = useState<DevicePerformanceInfo>(() =>
    getDevicePerformanceInfo(),
  );

  useEffect(() => {
    const handleUpdate = () => {
      setDeviceInfo(getDevicePerformanceInfo());
    };

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dataMedia = window.matchMedia("(prefers-reduced-data: reduce)");

    motionMedia.addEventListener("change", handleUpdate);
    dataMedia.addEventListener("change", handleUpdate);

    const nav = window.navigator as NavigatorWithConnection;
    if (typeof nav.connection?.addEventListener === "function") {
      nav.connection.addEventListener("change", handleUpdate);
    }

    return () => {
      motionMedia.removeEventListener("change", handleUpdate);
      dataMedia.removeEventListener("change", handleUpdate);
      if (typeof nav.connection?.removeEventListener === "function") {
        nav.connection.removeEventListener("change", handleUpdate);
      }
    };
  }, []);

  const transitionsEnabled =
    preference === "enabled"
      ? !deviceInfo.prefersReducedMotion
      : preference === "disabled"
        ? false
        : !deviceInfo.isLowEndDevice;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.lowDevice = deviceInfo.isLowEndDevice
        ? "true"
        : "false";
      document.documentElement.dataset.pageTransitions = transitionsEnabled
        ? "enabled"
        : "disabled";
    }
  }, [deviceInfo.isLowEndDevice, transitionsEnabled]);

  return {
    deviceInfo,
    isLowDevice: deviceInfo.isLowEndDevice,
    preference,
    setPreference,
    transitionsEnabled,
  };
}
