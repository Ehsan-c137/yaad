import { afterEach, describe, expect, it, vi } from "vitest";

import { detectOS } from "../detect-os";

interface Platform {
  userAgentData?: { platform?: string };
  platform?: string;
}

function stubNavigator(platform: Platform) {
  vi.stubGlobal("navigator", {
    ...(typeof navigator === "object" ? navigator : {}),
    ...platform,
  });
}

describe("detectOS (Unit Test)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects Windows", () => {
    stubNavigator({ platform: "Win32" });

    expect(detectOS()).toBe("Windows");
  });

  it("detects macOS", () => {
    stubNavigator({ platform: "MacIntel" });

    expect(detectOS()).toBe("Mac");
  });

  it("detects Linux", () => {
    stubNavigator({ platform: "Linux x86_64" });

    expect(detectOS()).toBe("Linux");
  });

  it("detects Android via userAgentData", () => {
    stubNavigator({
      platform: "Linux armv8l",
      userAgentData: { platform: "Android" },
    });

    expect(detectOS()).toBe("Android");
  });

  it("detects iOS from the platform string", () => {
    stubNavigator({ platform: "iPhone", userAgentData: undefined });

    expect(detectOS()).toBe("iOS");
  });

  it("prefers userAgentData.platform over navigator.platform", () => {
    stubNavigator({
      platform: "Win32",
      userAgentData: { platform: "Mac" },
    });

    expect(detectOS()).toBe("Mac");
  });

  it("returns 'Unknown OS' for unrecognized platforms", () => {
    stubNavigator({ platform: "FreeBSD" });

    expect(detectOS()).toBe("Unknown OS");
  });
});
