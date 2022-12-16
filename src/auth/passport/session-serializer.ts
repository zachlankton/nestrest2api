import { PassportSerializer } from '@nestjs/passport';
import { FetchUsersDto } from 'prisma/generated/users/dto/fetch-users.dto';

export class SessionSerializer extends PassportSerializer {
  async deserializeUser(
    payload: any,
    done: (err: any, user: FetchUsersDto | null) => void,
  ) {
    done(null, payload);
  }

  serializeUser(user: any, done: (err: any, user: FetchUsersDto) => void) {
    done(null, user);
  }
}
