import { WorkspaceLayoutSkeleton } from "@ui/skeleton";
import { Analytics } from "@vercel/analytics/react";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router";

import { Providers } from "@/providers/providers-index";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import { PwaManager } from "./pwa-manager";

const MainLayout = lazy(() =>
  import("@/components/layout/main-layout").then((m) => ({
    default: m.MainLayout,
  })),
);

const HomePage = lazy(() =>
  import("@/components/pages/home-page").then((m) => ({
    default: m.HomePage,
  })),
);

const WorkspaceHomePage = lazy(() =>
  import("@/components/pages/workspace-page").then((m) => ({
    default: m.WorkspaceHomePage,
  })),
);

const EditorShell = lazy(() =>
  import("@/components/editor/editor-shell").then((m) => ({
    default: m.EditorShell,
  })),
);

const TrashPage = lazy(() =>
  import("@/components/pages/trash-page").then((m) => ({
    default: m.TrashPage,
  })),
);

const GraphPage = lazy(() =>
  import("@/components/pages/graph-page").then((m) => ({
    default: m.GraphPage,
  })),
);

function RootRedirect() {
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as unknown as { standalone?: boolean }).standalone,
      )
    );
  });

  useEffect(() => {
    if (!isStandalone) {
      window.location.replace("/");
    }
  }, [isStandalone]);

  if (isStandalone) {
    return <Navigate to="/workspace/ws_personal" replace />;
  }

  return null;
}

function WorkspaceHomeRoute() {
  const { workspaceId } = useParams();
  const workspace = useWorkspaceStore((s) =>
    workspaceId ? s.workspaces[workspaceId] : undefined,
  );
  return <WorkspaceHomePage workspace={workspace} />;
}

function WorkspaceGraphRoute() {
  const { workspaceId } = useParams();
  return <GraphPage workspaceId={workspaceId ?? ""} />;
}

function WorkspaceTrashRoute() {
  const { workspaceId } = useParams();
  return <TrashPage workspaceId={workspaceId ?? ""} />;
}

function WorkspacePageRoute() {
  const { pageId } = useParams();
  return <EditorShell key={pageId} pageId={pageId ?? ""} />;
}

function PageGraphRoute() {
  const { workspaceId, pageId } = useParams();
  return <GraphPage workspaceId={workspaceId ?? ""} pageId={pageId} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <PwaManager />
      {!import.meta.env.DEV && <Analytics />}
      <Providers>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/landing" element={<RootRedirect />} />
          <Route
            element={
              <Suspense fallback={<WorkspaceLayoutSkeleton />}>
                <MainLayout />
              </Suspense>
            }
          >
            <Route path="/app" element={<HomePage />} />
            <Route
              path="/workspace/:workspaceId"
              element={<WorkspaceHomeRoute />}
            />
            <Route
              path="/workspace/:workspaceId/graph"
              element={<WorkspaceGraphRoute />}
            />
            <Route
              path="/workspace/:workspaceId/trash"
              element={<WorkspaceTrashRoute />}
            />
            <Route
              path="/workspace/:workspaceId/:pageId"
              element={<WorkspacePageRoute />}
            />
            <Route
              path="/workspace/:workspaceId/:pageId/graph"
              element={<PageGraphRoute />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
