import {
  Controller,
  Req,
  Post,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Header,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { decrypt, encrypt } from 'src/lib/crypto';
import { AuthService } from './auth.service';
import { Permissions } from './decorators/permissions.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { LoginDTO } from './dto/login.dto';
import { SetPasswordDTO } from './dto/set-password.dto';
import { UserWithRoles } from './dto/UserWithRoles.dto';
import { Permission } from './enums/permissions.enum';
import { Role } from './enums/roles.enum';
import { AuthenticatedGuard } from './guards/Auth.guard';
import { LocalAuthGuard } from './passport/local-auth.guard';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login using email and password' })
  @ApiResponse({ type: UserWithRoles, status: 201 })
  async login(
    @Body() login: LoginDTO,
    @Req() req: Request,
  ): Promise<UserWithRoles | null> {
    const user = req.user as any;

    if (user.err) {
      req.user = undefined;
      delete (req.session as any).passport;

      await this.forceOneSecond(); // slow down brute force
      throw new UnauthorizedException();
    }

    user.token = req.session.id;
    return user;
  }

  private async forceOneSecond() {
    if (JSON.parse((process.env.DEVMODE as string) || 'null')) return;
    return new Promise<void>((res) => {
      setTimeout(() => res(), 1000);
    });
  }

  @Post('get-password-reset-email/:email')
  @ApiOperation({ summary: 'Request a password reset email' })
  async getResetPasswordEmail(@Param('email') email: string) {
    this.authService.getPasswordResetEmail(email);
    return;
  }

  @Get('reset-password/:key')
  @ApiResponse({
    status: 200,
    content: { 'text/html': {} },
    description:
      'This endpoint serves a simple HTML page to reset the password',
  })
  @ApiOperation({ summary: 'A User Password Reset HTML page' })
  @Header('content-type', 'text/html')
  async resetPasswordPage(@Param('key') resetKey: string) {
    return this.authService.getResetPasswordPage(resetKey);
  }

  @Post('reset-password/:key')
  @ApiOperation({
    summary: 'POST Handler for Password Reset HTML page',
    requestBody: {
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: { pw1: { type: 'string' }, pw2: { type: 'string' } },
          },
        },
      },
    },
  })
  async resetPasswordPost(
    @Param('key') resetKey: string,
    @Body() passwords: any,
  ) {
    return this.authService.resetPasswordPostService(resetKey, passwords);
  }

  @Post('change-password')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Change a user password (needs old password)' })
  async changePassword(@Body() setPW: ChangePasswordDTO) {
    const results = await this.authService.changePassword(setPW);
    if (results.err) throw new HttpException(results, HttpStatus.BAD_REQUEST);
    return results;
  }

  @Post('set-password')
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Force Set a User Password (Requires SuperAdmin)' })
  async setPassword(@Body() setPW: SetPasswordDTO) {
    const results = await this.authService.setPassword(setPW);
    if (results.err) throw new HttpException(results, HttpStatus.BAD_REQUEST);
    return results;
  }

  @Get('test-crypto')
  @Permissions(Permission.anotherPermission)
  @ApiOperation({ summary: 'A sample endpoint that uses AES encryption' })
  async testCrypto(@Req() req: Request) {
    console.log(req.isAuthenticated());
    const hash = encrypt('Hello World!');
    const reverse = decrypt(hash);
    return { hash, reverse };
  }
}
