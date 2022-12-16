import { IsDefined, IsEmail, IsString } from 'class-validator';

export class SetPasswordDTO {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined({ message: 'You must pass in a new password!' })
  @IsString()
  newPassword: string;
}
