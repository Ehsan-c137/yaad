import { lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router";

import { EditorShell } from "@/components/editor/editor-shell";
import { MainLayout } from "@/components/layout/main-layout";
import { HomePage } from "@/components/pages/home-page";
import { WorkspaceHomePage } from "@/components/pages/workspace-page";
import { Providers } from "@/providers/providers-index";
import { useWorkspaceStore } from "@/store/use-workspace-store";

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
  return <EditorShell pageId={pageId ?? ""} />;
}

function PageGraphRoute() {
  const { workspaceId, pageId } = useParams();
  return <GraphPage workspaceId={workspaceId ?? ""} pageId={pageId} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
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
