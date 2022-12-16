import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PermissionsGuard } from './auth/guards/Permission.guard';
import { RolesGuard } from './auth/guards/Role.guard';
import { PermissionsModule } from './permissions/permissions.prisma.module';
import { RolesModule } from './roles/roles.prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, RolesModule, PermissionsModule],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
