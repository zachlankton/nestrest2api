import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUsersDto } from './dto/create-users.dto';
import { FindUsersDto } from 'prisma/generated/users/dto/find-users.dto';
import { PrismaNestedLimited } from './dto/prisma-nested.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { Users } from 'prisma/generated/users/entities/users.entity';
import { UsersControllerPrisma } from 'prisma/generated/users/users.prisma.controller';
import { UsersServicePrisma } from 'prisma/generated/users/users.prisma.service';
import { sanitize } from 'src/lib/sanitize';
import { Request } from 'express';
import { UserWithRoles } from 'src/auth/dto/UserWithRoles.dto';
import { Role } from 'src/auth/enums/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Users as PrismaUsers } from 'prisma/prisma-client';

@ApiBearerAuth()
@ApiTags('Users')
@Roles(Role.Admin)
@Controller('users')
export class UsersController extends UsersControllerPrisma {
  constructor(private readonly usersServicePrisma: UsersServicePrisma) {
    super(usersServicePrisma);
  }

  async createUsers(@Body() usersData: CreateUsersDto): Promise<Users> {
    return super.createUsers(usersData as any);
  }

  async updateUsers(@Body() usersData: UpdateUsersDto): Promise<Users> {
    return super.updateUsers(usersData as any);
  }

  @ApiOperation({
    summary: 'Create New User',
    externalDocs: {
      url: 'https://www.prisma.io/docs/concepts/components/prisma-client/crud',
      description:
        'This endpoint exposes the full power of prisma creating and updating new docs, including relations',
    },
  })
  @Post()
  async createUsersOverride(
    @Body() usersData: CreateUsersDto,
    @Req() req: Request,
  ): Promise<Users> {
    await this.sanitizeRolesAndPermissions(usersData);
    this.checkRolesAndPermissions(usersData, req.user as UserWithRoles);
    (usersData as PrismaUsers).createdBy = (req?.user as UserWithRoles).email;
    (usersData as PrismaUsers).updatedBy = (req?.user as UserWithRoles).email;
    return this.createUsers(usersData);
  }

  @ApiOperation({
    summary: 'Update Existing User',
    externalDocs: {
      url: 'https://www.prisma.io/docs/concepts/components/prisma-client/crud',
      description:
        'This endpoint exposes the full power of prisma creating and updating new docs, including relations',
    },
  })
  @Patch()
  async updateUsersOverride(
    @Body() usersData: UpdateUsersDto,
    @Req() req: Request,
  ): Promise<Users> {
    await this.sanitizeRolesAndPermissions(usersData.data as CreateUsersDto);

    this.checkUserIsNotModifyingThemselves(
      usersData,
      req.user as UserWithRoles,
    );

    this.checkRolesAndPermissions(
      usersData.data as CreateUsersDto,
      req.user as UserWithRoles,
    );

    (usersData as Partial<PrismaUsers>).updatedBy = (
      req?.user as UserWithRoles
    ).email;
    return this.updateUsers(usersData);
  }

  private async sanitizeRolesAndPermissions(usersData: CreateUsersDto) {
    usersData.roles =
      usersData.roles && (await sanitize(PrismaNestedLimited, usersData.roles));
    usersData.permissions =
      usersData.permissions &&
      (await sanitize(PrismaNestedLimited, usersData.permissions));
  }

  private checkUserIsNotModifyingThemselves(
    usersData: UpdateUsersDto,
    user: UserWithRoles,
  ) {
    if (user.flatRolesList.includes(Role.SuperAdmin)) return true;
    if (user.id === usersData.where.id || user.email === usersData.where.email)
      throw new HttpException(
        'You cannot modify your own user account!',
        HttpStatus.FORBIDDEN,
      );
  }

  private checkRolesAndPermissions(
    usersData: CreateUsersDto,
    user: UserWithRoles,
  ) {
    if (user.flatRolesList.includes(Role.SuperAdmin)) return true;
    usersData.roles && this.checkRoles(usersData.roles, user);
    usersData.permissions && this.checkPermissions(usersData.permissions, user);
  }

  private checkRoles(roles: PrismaNestedLimited, user: UserWithRoles) {
    roles.connect && this.currentUserHasAllRoles(roles.connect, user);
    roles.disconnect && this.currentUserHasAllRoles(roles.disconnect, user);
  }

  private checkPermissions(
    permissions: PrismaNestedLimited,
    user: UserWithRoles,
  ) {
    permissions.connect &&
      this.currentUserHasAllPerms(permissions.connect, user);
    permissions.disconnect &&
      this.currentUserHasAllPerms(permissions.disconnect, user);
  }

  private currentUserHasAllRoles(roles: any, user: UserWithRoles) {
    roles.length
      ? roles.map((role: any) => this.currentUserHasRole(role, user.roles))
      : this.currentUserHasRole(roles, user.roles);
  }

  private currentUserHasAllPerms(permissions: any, user: UserWithRoles) {
    permissions.length
      ? permissions.map((perm: any) =>
          this.currentUserHasPerm(perm, user.permissions),
        )
      : this.currentUserHasPerm(permissions, user.permissions);
  }

  private currentUserHasRole(role: any, userRoles: any) {
    const userHasRole = userRoles.some((uRole: any) => {
      const idMatch = role.id ? role.id === uRole.id : true;
      const roleMatch = role.role ? role.role === uRole.role : true;
      return idMatch && roleMatch;
    });

    if (!userHasRole)
      throw new HttpException(
        'You cannot assign/unassign roles you do not have',
        HttpStatus.FORBIDDEN,
      );
  }

  private currentUserHasPerm(perm: any, userPermissions: any) {
    const userHasPerm = userPermissions.some((uPerm: any) => {
      const idMatch = perm.id ? perm.id === uPerm.id : true;
      const permMatch = perm.permission
        ? perm.permission === uPerm.permission
        : true;
      return idMatch && permMatch;
    });

    if (!userHasPerm)
      throw new HttpException(
        'You cannot assign/unassign permissions you do not have!',
        HttpStatus.FORBIDDEN,
      );
  }

  @ApiOperation({
    summary: 'Find/Filter/List Users',
    externalDocs: {
      url: 'https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting',
      description:
        'This endpoint exposes the full power of prisma filtering and sorting',
    },
  })
  @Post('find')
  async findUsers(@Body() filters: FindUsersDto): Promise<Users[]> {
    return super.findUsers(filters);
  }

  @ApiOperation({ summary: 'Get User By ID' })
  @ApiResponse({ type: Users })
  @Get(':id')
  async getUsersById(@Param('id') id: string): Promise<Users | null> {
    return super.getUsersById(id);
  }

  @ApiOperation({ summary: 'Delete User By ID' })
  @ApiResponse({ type: Users })
  @Delete(':id')
  async deleteUsersById(@Param('id') id: string): Promise<Users | null> {
    return super.deleteUsersById(id);
  }

  @ApiOperation({ summary: 'Get User By Email' })
  @ApiResponse({ type: Users })
  @Get('by-email/:email')
  async getUsersByemail(@Param('email') email: string): Promise<Users | null> {
    return super.getUsersByemail(email);
  }
}
