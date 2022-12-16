import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/local.strategy';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './passport/session-serializer';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
