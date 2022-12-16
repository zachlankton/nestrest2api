import { FetchUsersDto } from '../dto/fetch-users.dto';
import { IsString } from 'class-validator';

export class Users extends FetchUsersDto {
  id: number;

  @IsString()
  phash: string | null;
}
