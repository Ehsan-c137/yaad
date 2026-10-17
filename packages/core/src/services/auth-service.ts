import { getDefaultApiBaseUrl } from "../constants/endpoints.js";
import { useUserStore } from "../store/use-user-store";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  defaultWorkspaceId?: string;
  workspaces?: { id: string; name: string; role?: string }[];
}

export interface IAuthService {
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  getToken: () => string | null;
}

export class AuthService implements IAuthService {
  private readonly baseUrl: string;

  constructor(baseUrl = getDefaultApiBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Registration failed");
    }

    const data: AuthResponse = await res.json();
    useUserStore.getState().setAuth({
      token: data.accessToken,
      userId: data.user.id,
      email: data.user.email,
      name,
    });

    await this.syncUserWorkspaces(data);

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Login failed");
    }

    const data: AuthResponse = await res.json();
    useUserStore.getState().setAuth({
      token: data.accessToken,
      userId: data.user.id,
      email: data.user.email,
    });

    await this.syncUserWorkspaces(data);

    return data;
  }

  private async syncUserWorkspaces(data: AuthResponse): Promise<void> {
    try {
      let wsList = data.workspaces;

      if (!wsList || wsList.length === 0) {
        const token = data.accessToken;
        const res = await fetch(`${this.baseUrl}/workspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          wsList = await res.json();
        }
      }

      if (wsList && wsList.length > 0) {
        const { useWorkspaceStore } =
          await import("../store/use-workspace-store");

        for (const ws of wsList) {
          await useWorkspaceStore.getState().registerWorkspace({
            id: ws.id,
            name: ws.name,
            icon: "💼",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        const currentActive = useWorkspaceStore.getState().activeWorkspaceId;
        const targetWs =
          currentActive &&
          wsList.some((w: { id: string }) => w.id === currentActive)
            ? currentActive
            : wsList.some((w: { id: string }) => w.id === "ws_personal")
              ? "ws_personal"
              : data.defaultWorkspaceId || wsList[0].id;
        await useWorkspaceStore.getState().setActiveWorkspace(targetWs);

        // Reconcile pre-login local pages so they are pushed to the user's remote account
        try {
          const { workspaceService } = await import("./workspace-service");
          const { storage } = await import("../lib/storage/storage-provider");
          const localTree = await workspaceService.getWorkspaceTree(targetWs);

          if (localTree && localTree.length > 0) {
            await workspaceService.saveWorkspaceTree(targetWs, localTree);

            for (const node of localTree) {
              const doc = await storage.getDocument(node.id);

              if (doc) {
                await storage.saveDocument(doc);
              }
            }
          }
        } catch (e) {
          console.warn(
            "[AuthService] Error enqueuing local pages on login:",
            e,
          );
        }
      }
    } catch (err) {
      console.warn("[AuthService] Error syncing user workspaces:", err);
    }

    try {
      const { syncWorker } = await import("../lib/storage/storage-provider");
      void syncWorker.syncNow();
    } catch (err) {
      console.warn("[AuthService] Error triggering sync worker:", err);
    }
  }

  logout(): void {
    useUserStore.getState().clearAuth();
  }

  getToken(): string | null {
    return useUserStore.getState().token;
  }
}

export const authService = new AuthService();
