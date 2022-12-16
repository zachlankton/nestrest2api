import { Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';

import { UsersServicePrisma } from './users.prisma.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { Users } from './entities/users.entity';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { ApiResponse } from '@nestjs/swagger';

export class UsersControllerPrisma {
  constructor(private readonly usersService: UsersServicePrisma) {}

  @Post()
  async createUsers(@Body() usersData: CreateUsersDto): Promise<Users> {
    return this.usersService.createUsers(usersData);
  }

  @Patch()
  async updateUsers(@Body() usersData: UpdateUsersDto): Promise<Users> {
    return this.usersService.updateUsers(usersData);
  }

  @Post('find')
  async findUsers(@Body() filters: FindUsersDto): Promise<Users[]> {
    return this.usersService.findUsers({ ...filters });
  }

  @ApiResponse({ type: Users })
  @Get(':id')
  async getUsersById(@Param('id') id: string): Promise<Users | null> {
    return this.usersService.getSingleUsers({ id: Number(id) });
  }

  @ApiResponse({ type: Users })
  @Delete(':id')
  async deleteUsersById(@Param('id') id: string): Promise<Users | null> {
    return this.usersService.deleteUsers({ id: Number(id) });
  }

  @ApiResponse({ type: Users })
  @Get('by-email/:email')
  async getUsersByemail(@Param('email') email: string): Promise<Users | null> {
    return this.usersService.getSingleUsers({ email });
  }
}
