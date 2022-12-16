import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any) {
    if (info && info.message === 'Missing credentials')
      return { id: 0, err: true };
    return user;
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;
    request.logOut &&
      (await request.logOut((err) => {
        err && console.error(err);
      }));
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}
