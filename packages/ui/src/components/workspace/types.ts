import type { IWorkspaceMemberService } from "@yaad/core/services/workspace-member-service";
import type {
  WorkspaceMember,
  WorkspaceRole,
} from "@yaad/core/types/workspace";

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName?: string;
  workspaceIcon?: string;
  pageId?: string;
  memberService?: IWorkspaceMemberService;
}

export interface ShareLinkBarProps {
  shareUrl: string;
}

export interface GuestNoticeProps {
  onSignInClick: () => void;
}

export interface InviteMemberFormProps {
  onInvite: (email: string, role: WorkspaceRole) => Promise<void>;
}

export interface MemberRowProps {
  member: WorkspaceMember;
  currentUserEmail?: string | null;
  canManageRoles?: boolean;
  onRemove: (userId: string) => Promise<void> | void;
  onUpdateRole?: (userId: string, role: WorkspaceRole) => Promise<void> | void;
}

export interface MemberListProps {
  members: WorkspaceMember[];
  isLoading: boolean;
  currentUserEmail?: string | null;
  canManageRoles?: boolean;
  onRemove: (userId: string) => Promise<void> | void;
  onUpdateRole?: (userId: string, role: WorkspaceRole) => Promise<void> | void;
}
