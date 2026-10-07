"use client";

/* eslint-disable react-refresh/only-export-components */
import { createContext, use } from "react";

export interface WindowControls {
  minimize: () => Promise<void> | void;
  toggleMaximize: () => Promise<void> | void;
  close: () => Promise<void> | void;
}

export interface PlatformContextType {
  isDesktop: boolean;
  windowControls?: WindowControls;
}

export const PlatformContext = createContext<PlatformContextType>({
  isDesktop: false,
});
PlatformContext.displayName = "PlatformContext";

export const usePlatform = () => use(PlatformContext);
export const PlatformProvider = PlatformContext.Provider;
