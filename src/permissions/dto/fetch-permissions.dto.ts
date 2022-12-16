import { IsOptional, IsDefined, IsString, Allow } from 'class-validator';

export class FetchPermissionsDto {
  @IsOptional()
  id: number;

  @IsDefined()
  @IsString()
  permission: string;

  @Allow()
  roles?: any[];

  @Allow()
  users?: any[];
}
