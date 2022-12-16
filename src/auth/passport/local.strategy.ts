import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // dummy data to keep bad requests timing consistent
    email = email || 'asdf';
    password = password || 'asdf';
    const user = await this.authService.validateUser(email, password);
    if (!user) return { id: 0, err: true };
    return user;
  }
}
