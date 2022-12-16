import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { UsersServicePrisma } from 'prisma/generated/users/users.prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersServicePrisma, PrismaService],
})
export class UsersModule {}
