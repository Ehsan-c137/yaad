"use client";

import { createContext, useContext } from "react";

export interface WindowControls {
  minimize: () => void | Promise<void>;
  toggleMaximize: () => void | Promise<void>;
  close: () => void | Promise<void>;
}

export interface PlatformContextType {
  isDesktop: boolean;
  windowControls?: WindowControls;
}

export const PlatformContext = createContext<PlatformContextType>({
  isDesktop: false,
});

export const usePlatform = () => useContext(PlatformContext);
export const PlatformProvider = PlatformContext.Provider;
