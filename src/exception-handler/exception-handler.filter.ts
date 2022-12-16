import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { handlePrismaExceptions } from './prisma-exceptions';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let handled = false;
    const superCatch = (exp: unknown, hst: ArgumentsHost) =>
      super.catch(exp, hst);
    const setHandled = () => (handled = true);
    const exp = { exception, host, superCatch };

    !handled && handlePrismaExceptions(exp) && setHandled();

    if (process.env.DEBUG === 'true')
      !handled && console.error('DEBUG EXCEPTION', { exception, host });
    !handled && super.catch(exception, host);
  }
}
