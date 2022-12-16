import { Module } from '@nestjs/common';
import { PermissionsServicePrisma } from './permissions.prisma.service';
import { PermissionsControllerPrisma } from './permissions.prisma.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PermissionsControllerPrisma],
  providers: [PermissionsServicePrisma, PrismaService],
})
export class PermissionsModule {}
