export function detectOS() {
  // if a browser has no support for navigator.userAgentData.platform use platform as fallback
  const userAgent = (
    navigator?.userAgentData.platform ?? navigator.platform
  ).toLowerCase();

  if (userAgent.includes("win")) {
    return "Windows";
  } else if (userAgent.includes("android")) {
    return "Android";
  } else if (userAgent.includes("mac")) {
    return "Mac";
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return "iOS";
  } else if (userAgent.includes("linux")) {
    return "Linux";
  }

  return "Unknown OS";
}
