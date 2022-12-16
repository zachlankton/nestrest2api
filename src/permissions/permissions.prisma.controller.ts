import { Controller, Get, UseGuards } from '@nestjs/common';

import { PermissionsServicePrisma } from './permissions.prisma.service';
import { Permissions } from './entities/permissions.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/Auth.guard';

@ApiBearerAuth()
@ApiTags('Roles and Permissions')
@UseGuards(AuthenticatedGuard)
@Controller('permissions')
export class PermissionsControllerPrisma {
  constructor(private readonly permissionsService: PermissionsServicePrisma) {}

  @Get()
  @ApiOperation({ summary: 'List All Permissions' })
  async getAllRoles(): Promise<Permissions[]> {
    return this.permissionsService.findPermissions({});
  }
}
