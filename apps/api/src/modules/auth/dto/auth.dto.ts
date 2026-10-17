import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password!: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
}

export interface AuthResponseDto {
  user: AuthUserResponse;
  accessToken: string;
  defaultWorkspaceId?: string;
  workspaces?: { id: string; name: string; role?: string }[];
}
