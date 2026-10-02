/**
 * Information regarding the client's hardware capabilities, network conditions,
 * and accessibility preferences used to determine whether animations and transitions
 * should be rendered or disabled for performance.
 */
export interface DevicePerformanceInfo {
  /**
   * Number of logical processor cores available (navigator.hardwareConcurrency).
   */
  cores: number | null;
  /**
   * Approximate device memory in GiB (navigator.deviceMemory).
   */
  deviceMemory: number | null;
  /**
   * Whether the user has requested reduced data or connection has saveData enabled.
   */
  saveData: boolean;
  /**
   * Whether the user or OS prefers reduced motion.
   */
  prefersReducedMotion: boolean;
  /**
   * Whether the user or OS prefers reduced data.
   */
  prefersReducedData: boolean;
  /**
   * True if the device exhibits low CPU, low RAM, slow network, or reduced motion/data preferences.
   */
  isLowEndDevice: boolean;
}

type ExtendedNavigator = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
  deviceMemory?: number;
};

function hasReducedMotionPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasReducedDataPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

function checkHardwareConstraints(
  cores: number | null,
  deviceMemory: number | null,
): boolean {
  const lowCores = cores !== null && cores <= 4;
  const lowMemory = deviceMemory !== null && deviceMemory < 4;
  return lowCores || lowMemory;
}

/**
 * Inspects device environment and returns comprehensive performance capabilities.
 */
export function getDevicePerformanceInfo(): DevicePerformanceInfo {
  if (typeof window === "undefined") {
    return {
      cores: null,
      deviceMemory: null,
      saveData: false,
      prefersReducedMotion: false,
      prefersReducedData: false,
      isLowEndDevice: false,
    };
  }

  const prefersReducedMotion = hasReducedMotionPreference();
  const prefersReducedData = hasReducedDataPreference();

  const nav = window.navigator as ExtendedNavigator;
  const cores =
    typeof nav.hardwareConcurrency === "number"
      ? nav.hardwareConcurrency
      : null;
  const deviceMemory =
    typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;

  const isSaveDataActive =
    Boolean(nav.connection?.saveData) || prefersReducedData;
  const isSlowNetwork =
    nav.connection?.effectiveType === "slow-2g" ||
    nav.connection?.effectiveType === "2g";

  const isConstrained = checkHardwareConstraints(cores, deviceMemory);

  const isLowEnd =
    prefersReducedMotion ||
    isSaveDataActive ||
    isSlowNetwork ||
    isConstrained;

  return {
    cores,
    deviceMemory,
    saveData: isSaveDataActive,
    prefersReducedMotion,
    prefersReducedData,
    isLowEndDevice: isLowEnd,
  };
}

/**
 * Returns true if the current device is considered lower-end or has reduced motion enabled.
 */
export function isLowEndDevice(): boolean {
  return getDevicePerformanceInfo().isLowEndDevice;
}
