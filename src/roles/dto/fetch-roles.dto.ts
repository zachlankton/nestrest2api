import { IsOptional, IsDefined, IsString, Allow } from 'class-validator';

export class FetchRolesDto {
  @IsOptional()
  id: number;

  @IsDefined()
  @IsString()
  role: string;

  @Allow()
  permissions?: any[];

  @Allow()
  users?: any[];
}
