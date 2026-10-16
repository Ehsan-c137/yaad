import { useUserStore } from '../store/use-user-store';
import { getDefaultApiBaseUrl } from '../constants/endpoints.js';
import type { WorkspaceMember, WorkspaceRole } from '../types/workspace';

export interface AddMemberPayload {
  email: string;
  role?: WorkspaceRole;
}

export interface IWorkspaceMemberService {
  getMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  addMember(workspaceId: string, payload: AddMemberPayload): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, memberUserId: string): Promise<void>;
  joinWorkspace(workspaceId: string): Promise<WorkspaceMember & { workspaceName?: string }>;
}

export function createWorkspaceMemberService(
  baseUrl = getDefaultApiBaseUrl(),
  getToken: () => string | null = () => useUserStore.getState().token,
  fetchFn: typeof fetch = globalThis.fetch,
): IWorkspaceMemberService {
  const getHeaders = () => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  return {
    async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
      const res = await fetchFn(`${baseUrl}/workspaces/${workspaceId}/members`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Failed to fetch members');
      }
      return res.json();
    },

    async addMember(workspaceId: string, payload: AddMemberPayload): Promise<WorkspaceMember> {
      const res = await fetchFn(`${baseUrl}/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Failed to add member');
      }
      return res.json();
    },

    async removeMember(workspaceId: string, memberUserId: string): Promise<void> {
      const res = await fetchFn(`${baseUrl}/workspaces/${workspaceId}/members/${memberUserId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Failed to remove member');
      }
    },

    async joinWorkspace(workspaceId: string): Promise<WorkspaceMember & { workspaceName?: string }> {
      const res = await fetchFn(`${baseUrl}/workspaces/${workspaceId}/join`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Failed to join workspace');
      }
      return res.json();
    },
  };
}

export const workspaceMemberService = createWorkspaceMemberService();
