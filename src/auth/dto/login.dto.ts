import { Allow } from 'class-validator';

export class LoginDTO {
  @Allow()
  email: string;

  @Allow()
  password: string;
}
