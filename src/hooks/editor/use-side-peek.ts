"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SIDE_PEEK_KEY = "peek";

export function useSidePeek() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const peekDocId = searchParams.get(SIDE_PEEK_KEY);

  const openSidePeek = (docId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SIDE_PEEK_KEY, docId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeSidePeek = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(SIDE_PEEK_KEY);
    router.push(`${pathname}?${params.toString()}`);
  };

  return {
    isOpen: Boolean(peekDocId),
    peekDocId,
    openSidePeek,
    closeSidePeek,
  };
}
