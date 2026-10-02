"use client";

import { createContext, useContext } from "react";

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

export const usePlatform = () => useContext(PlatformContext);
export const PlatformProvider = PlatformContext.Provider;
