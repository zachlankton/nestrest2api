import { Controller, Get, UseGuards } from '@nestjs/common';

import { RolesServicePrisma } from './roles.prisma.service';
import { Roles } from './entities/roles.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/Auth.guard';

@ApiBearerAuth()
@ApiTags('Roles and Permissions')
@UseGuards(AuthenticatedGuard)
@Controller('roles')
export class RolesControllerPrisma {
  constructor(private readonly rolesService: RolesServicePrisma) {}

  @Get()
  @ApiOperation({ summary: 'List All Roles' })
  async getAllRoles(): Promise<Roles[]> {
    return this.rolesService.findRoles({});
  }
}
