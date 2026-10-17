import { use } from "react";

import type { CollabContextValue } from "./collab-context";

import { CollabContext } from "./collab-context";

export function useCollabContext(): CollabContextValue {
  return use(CollabContext);
}
