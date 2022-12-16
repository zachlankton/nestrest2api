import { Module } from '@nestjs/common';
import { RolesServicePrisma } from './roles.prisma.service';
import { RolesControllerPrisma } from './roles.prisma.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RolesControllerPrisma],
  providers: [RolesServicePrisma, PrismaService],
})
export class RolesModule {}
