import { IsDefined } from 'class-validator';
import { FetchUsersDto } from 'prisma/generated/users/dto/fetch-users.dto';

export class UserWithRoles extends FetchUsersDto {
  @IsDefined()
  flatPermissionsList: string[];

  @IsDefined()
  flatRolesList: string[];

  @IsDefined()
  token: string;
}
