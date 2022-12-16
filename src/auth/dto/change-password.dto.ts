import { Allow, IsDefined, IsEmail, IsString } from 'class-validator';

export class ChangePasswordDTO {
  @IsDefined()
  @IsEmail()
  email: string;

  @Allow()
  oldPassword: string;

  @IsDefined({ message: 'You must pass in a new password!' })
  @IsString()
  newPassword: string;
}
