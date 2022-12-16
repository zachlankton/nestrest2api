import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { Users } from './entities/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { PartialCreateUsersDto } from './dto/update-users.dto';

@Injectable()
export class UsersServicePrisma {
  constructor(private prisma: PrismaService) {}

  async getSingleUsers(
    userWhereUniqueInput: Prisma.UsersWhereUniqueInput,
    include?: any,
  ): Promise<Users | null> {
    return this.prisma.users.findUnique({
      where: userWhereUniqueInput,
      include,
    });
  }

  async findUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsersWhereUniqueInput;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
    include?: any;
  }): Promise<Users[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async createUsers(data: CreateUsersDto): Promise<Users> {
    return this.prisma.users.create({
      data,
    });
  }

  async updateUsers(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: PartialCreateUsersDto;
  }): Promise<Users> {
    const { where, data } = params;
    return this.prisma.users.update({
      data,
      where,
    });
  }

  async deleteUsers(where: Prisma.UsersWhereUniqueInput): Promise<Users> {
    return this.prisma.users.delete({
      where,
    });
  }
}
