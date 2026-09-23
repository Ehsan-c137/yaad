import { useLocation, useNavigate, useSearchParams } from "react-router";

const SIDE_PEEK_KEY = "peek";

export function useSidePeek() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const peekDocId = searchParams.get(SIDE_PEEK_KEY);

  const openSidePeek = (docId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SIDE_PEEK_KEY, docId);
    navigate(`${pathname}?${params.toString()}`);
  };

  const closeSidePeek = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(SIDE_PEEK_KEY);
    navigate(`${pathname}?${params.toString()}`);
  };

  return {
    isOpen: Boolean(peekDocId),
    peekDocId,
    openSidePeek,
    closeSidePeek,
  };
}
