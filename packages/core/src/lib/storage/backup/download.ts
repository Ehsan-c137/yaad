import type { YaadExportPayload } from "./types";

/**
 * Triggers a browser download of the exported Yaad payload as a formatted JSON file.
 */
export function triggerDownloadJSON(
  payload: YaadExportPayload,
  filename?: string,
) {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `yaad-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
