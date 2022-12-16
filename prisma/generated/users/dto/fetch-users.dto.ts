import {
  IsOptional,
  IsDefined,
  IsEmail,
  IsString,
  Allow,
} from 'class-validator';

export class FetchUsersDto {
  @IsOptional()
  id: number;

  @IsDefined()
  @IsEmail()
  email: string;

  @Allow()
  createdBy: string;

  @Allow()
  updatedBy: string;

  @Allow()
  createdAt: Date;

  @Allow()
  updatedAt: Date;

  @Allow()
  roles?: any[];

  @Allow()
  permissions?: any[];
}
