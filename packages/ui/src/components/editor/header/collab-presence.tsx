import { useUserStore } from "@yaad/core/store/use-user-store";
import { useTranslation } from "react-i18next";

import { useCollabContext } from "@/context/use-collab";

export function CollabPresence() {
  const { t } = useTranslation();
  const { status, peers } = useCollabContext();
  const currentUser = useUserStore((s) => s.userName);
  const token = useUserStore((s) => s.token);

  if (!token) {
    return null;
  }

  const statusColor =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
        ? "bg-amber-500 animate-pulse"
        : "bg-zinc-400";

  const statusText =
    status === "connected"
      ? t("live")
      : status === "connecting"
        ? t("connecting")
        : t("offline");

  return (
    <div className="flex items-center gap-2">
      {/* Status Pill */}
      <div
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300"
        title={
          status === "connected" ? t("collabConnected") : t("collabStatus")
        }
      >
        <span className={`h-2 w-2 rounded-full ${statusColor}`} />
        <span>{statusText}</span>
        {currentUser && (
          <span className="text-zinc-400 font-normal">({currentUser})</span>
        )}
      </div>

      {/* Collaborator Avatars */}
      {peers.map((peer) => (
        <div
          key={peer.id}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950"
          style={{ backgroundColor: peer.color }}
          title={t("userIsEditing", { name: peer.name })}
        >
          {peer.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
