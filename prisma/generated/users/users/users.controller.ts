import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersControllerPrisma } from 'prisma/generated/users/users.prisma.controller';
import { UsersServicePrisma } from 'prisma/generated/users/users.prisma.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController extends UsersControllerPrisma {
  constructor(private readonly usersServicePrisma: UsersServicePrisma) {
    super(usersServicePrisma);
  }
}
