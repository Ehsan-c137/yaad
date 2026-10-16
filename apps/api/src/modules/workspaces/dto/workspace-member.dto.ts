import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export const WORKSPACE_ROLES = ['owner', 'member', 'viewer'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export class AddMemberDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsIn(WORKSPACE_ROLES, {
    message: `Role must be one of: ${WORKSPACE_ROLES.join(', ')}`,
  })
  role?: WorkspaceRole = 'member';
}

export interface WorkspaceMemberResponseDto {
  id: string;
  userId: string;
  email: string;
  role: string;
  createdAt: Date;
  workspaceName?: string;
}
