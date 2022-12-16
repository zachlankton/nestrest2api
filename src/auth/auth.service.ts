import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { Users } from 'prisma/generated/users/entities/users.entity';
import { UsersServicePrisma } from 'prisma/generated/users/users.prisma.service';
import { sanitize } from 'src/lib/sanitize';
import { sendEmail } from 'src/lib/sendgrid';
import { PrismaService } from 'src/prisma.service';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SetPasswordDTO } from './dto/set-password.dto';
import { UserWithRoles } from './dto/UserWithRoles.dto';

// used to keep bad user login return times consistent with good user bad pw
// per OWASP recommendations
const fakeHash =
  '$argon2id$v=19$m=65536,t=3,p=4$MJlu/7oeiDcOitmL4f6DMA$WuKDgZ59RaCCigFVK1hB+6XRTfqASio6CBEstpKXNyw';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersServicePrisma,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithRoles | null> {
    const user = await this.getUserWithRolesAndPermissions(email);
    if (!user) {
      await this.verifyPassword(fakeHash, 'fakePass');
      return null;
    }

    const pwHash = user?.phash as string;
    if (!(await this.verifyPassword(pwHash, password))) return null;

    const flatRolesList = this.getFlatRoles(user);
    const flatPermissionsList = this.getFlatPermissions(user);
    return sanitize(UserWithRoles, {
      ...user,
      flatRolesList,
      flatPermissionsList,
    });
  }

  private async getSingleUserByEmail(
    unsafeEmail: string,
  ): Promise<Users | null> {
    const user = await this.usersService.findUsers({
      where: { email: unsafeEmail },
    });

    if (user.length === 0) {
      console.log(`${unsafeEmail} was not found!!!`);
      return null;
    }

    return user[0];
  }

  private async deleteOldPasswordResets() {
    await this.prisma
      .$queryRaw`DELETE FROM "public"."ResetPasswordEmail" WHERE "createdAt" < now() - interval '20 minutes';`;
  }

  async deletePasswordResetForUser(userEmail: string) {
    await this.prisma
      .$queryRaw`DELETE FROM "public"."ResetPasswordEmail" WHERE email = ${userEmail};`;
    this.sendPasswordWasResetEmail(userEmail);
  }

  private async sendPasswordResetEmail(userEmail: string, randomKey: string) {
    const resp = await sendEmail({
      to: userEmail,
      subject: 'NestRest 2 Password Reset',
      text: `Go here to reset your password: ${process.env.SERVER_URL}/auth/reset-password/${randomKey}`,
      html: `<a href="${process.env.SERVER_URL}/auth/reset-password/${randomKey}">Click Here to reset your password</a> <br /> <p>This link expires in 20 minutes</p>`,
    }).catch((err) => [err]);

    if (resp[0].statusCode === 202) return true;

    console.error(resp);
    return false;
  }

  private async sendPasswordWasResetEmail(userEmail: string) {
    const resp = await sendEmail({
      to: userEmail,
      subject: 'NestRest 2 Your Password Was Reset!!!',
      text: `Your password was successfully reset!`,
    }).catch((err) => [err]);

    if (resp[0].statusCode === 202) return true;

    console.error(resp);
    return false;
  }

  private async storePasswordResetData(userEmail: string) {
    const randomKey = randomBytes(512).toString('hex');
    const resp: any = await this.prisma.resetPasswordEmail
      .create({
        data: { email: userEmail, key: randomKey },
      })
      .catch((err) => ({
        err,
      }));

    if (resp && resp.err) {
      console.error('STORE PASSWORD RESET DATA ERR', resp.err);
      return null;
    }
    return randomKey;
  }

  async getPasswordResetEmail(unsafeEmail: string) {
    const user = await this.getSingleUserByEmail(unsafeEmail);
    if (!user) return null;
    const userEmail = user.email;

    await this.deleteOldPasswordResets();

    const randomKey = await this.storePasswordResetData(userEmail);
    if (!randomKey) return null;

    if (await this.sendPasswordResetEmail(userEmail, randomKey))
      return { message: 'Password reset email was sent!' };

    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async getResetPasswordPage(resetKey: string) {
    if (await this.checkPasswordResetToken(resetKey))
      return this.getHTML('password-reset.html');
    return this.getHTML('password-reset-expired.html');
  }

  async resetPasswordPostService(resetKey: string, passwords: any) {
    const token = await this.checkPasswordResetToken(resetKey);
    if (!token) return this.getHTML('password-reset-expired.html');

    if (passwords.pw1 !== passwords.pw2)
      return this.getHTML(`password-no-match.html`);

    const checkPW = this.checkPasswordRequirements(passwords.pw1);
    if (checkPW.err) return this.getHTML('password-not-strong.html');

    const changePW = await this.setPassword({
      email: token.email,
      newPassword: passwords.pw1,
    });
    if (changePW.err) return this.getHTML('password-error.html');

    await this.deletePasswordResetForUser(token.email);
    return this.getHTML('password-changed.html');
  }

  private getHTML(path: string) {
    return readFileSync(`./src/auth/static/${path}`).toString();
  }

  async checkPasswordResetToken(resetKey: string) {
    await this.deleteOldPasswordResets();

    const token = await this.prisma.resetPasswordEmail.findUnique({
      where: { key: resetKey },
    });

    if (!token) return false;

    return token;
  }

  async changePassword(setPW: ChangePasswordDTO) {
    const { email, oldPassword, newPassword } = setPW;
    if (oldPassword === newPassword)
      return {
        message: 'New Password cannot be the same as the old!',
        err: true,
      };

    const pwReqs = this.checkPasswordRequirements(newPassword);
    if (pwReqs.err) return pwReqs;

    const user = await this.usersService.getSingleUsers({ email });
    if (!user) return { message: 'User Not Found', err: true };

    const pwHash = user.phash as string;

    const pwVerify = await this.verifyPassword(pwHash, oldPassword);
    if (pwVerify !== true)
      return { message: 'Old Password incorrect!', err: true };

    return await this.updatePasswordHash(email, newPassword);
  }

  async setPassword(setPW: SetPasswordDTO) {
    const { email, newPassword } = setPW;

    const pwReqs = this.checkPasswordRequirements(newPassword);
    if (pwReqs.err) return pwReqs;

    const user = await this.usersService.getSingleUsers({ email });
    if (!user) return { message: 'User Not Found', err: true };

    return await this.updatePasswordHash(email, newPassword);
  }

  checkPasswordRequirements(pw: string) {
    const pwReqsRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/g;
    const failMessage =
      'New Password must be Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character';
    if (pwReqsRegex.test(pw)) return { success: true };
    return { err: true, message: failMessage };
  }

  async updatePasswordHash(email: string, pw: string) {
    const newHash = await argon2.hash(pw);
    await this.usersService.updateUsers({
      where: { email },
      data: { phash: newHash },
    });
    return { message: 'Password updated!', err: null };
  }

  async verifyPassword(hash: string, pw: string) {
    if (hash === '' || hash === null || hash === undefined) return false;
    if (pw === '' || pw === null || pw === undefined) return false;

    const pwVerify = await argon2.verify(hash, pw).catch((err) => err);

    const notHashed =
      pwVerify.message &&
      pwVerify.message === 'pchstr must contain a $ as first char';

    if (notHashed) return false;

    return pwVerify === true;
  }

  private async getUserWithRolesAndPermissions(email: string) {
    return (await this.usersService.getSingleUsers(
      { email },
      { permissions: true, roles: { include: { permissions: true } } },
    )) as Users | null;
  }

  private getFlatRoles(user: Users | null) {
    if (!user) return [];

    const flatRolesList = new Set();
    user?.roles?.forEach((role) => flatRolesList.add(role.role));
    return [...flatRolesList];
  }

  private getFlatPermissions(user: Users | null) {
    if (!user) return [];

    const flatPermissionsList = new Set();

    user?.permissions?.forEach((permission) =>
      flatPermissionsList.add(permission.permission),
    );

    user?.roles?.forEach((role) =>
      role.permissions.forEach((permission: { permission: unknown }) =>
        flatPermissionsList.add(permission.permission),
      ),
    );

    return [...flatPermissionsList];
  }
}
