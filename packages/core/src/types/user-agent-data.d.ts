/**
 * Type definitions for the User-Agent Client Hints API.
 *
 * `navigator.userAgentData` is a Chromium-only API that is not part of
 * TypeScript's DOM lib yet, so it is declared here globally (this file is
 * an ambient declaration file: no imports/exports, so interfaces merge
 * with the global `Navigator` interface from `lib.dom.d.ts`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
 */

interface NavigatorUABrandVersion {
  readonly brand: string;
  readonly version: string;
}

interface UADataValues {
  readonly architecture?: string;
  readonly bitness?: string;
  readonly formFactors?: string[];
  readonly fullVersion?: string;
  readonly fullVersionList?: NavigatorUABrandVersion[];
  readonly model?: string;
  readonly platform?: string;
  readonly platformVersion?: string;
  readonly uaFullVersion?: string;
  readonly wow64?: boolean;
}

interface NavigatorUAData {
  readonly brands: NavigatorUABrandVersion[];
  readonly mobile: boolean;
  readonly platform: string;
  getHighEntropyValues: (hints: string[]) => Promise<UADataValues>;
  toJSON: () => UADataValues;
}

interface Navigator {
  readonly userAgentData?: NavigatorUAData;
}
