import { BadRequestException } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';

export function handlePrismaExceptions({ exception, host, superCatch }: any) {
  let isHandled = false;

  const handleKnown = () => {
    !isHandled && exception.code === 'P2002' && handle2002();
    !isHandled && exception.code === 'P2021' && handle2021();
    !isHandled && exception.code === 'P2025' && handle2025();
    !isHandled && handleDefaultReq();
  };

  const handleValidErr = () => {
    !isHandled &&
      knownReqErrMsg(exception.message.split('\n').slice(-4).join(' '));
  };

  const handle2002 = () => knownReqErrMsg(`'${field()}' needs to be unique!`);
  const handle2021 = () =>
    knownReqErrMsg(`table: '${table()}' does not exist!`);
  const handle2025 = () => knownReqErrMsg(cause());

  const handleDefaultReq = () =>
    knownReqErrMsg(`Unhandled Error on field: "${field()}"`);

  const field = () => exception.meta.target;
  const table = () => exception.meta.table;
  const cause = () => exception.meta.cause;

  const knownReqErrMsg = (msg: string) => {
    console.log('============================================================');
    console.error(exception);
    console.log('============================================================');
    superCatch(
      new BadRequestException('Prisma Err: ' + msg, {
        cause: new Error(),
        description: 'Primsa Err Code: ' + exception.code,
      }),
      host,
    );

    isHandled = true;
  };

  exception instanceof PrismaClientKnownRequestError && handleKnown();
  exception instanceof PrismaClientValidationError && handleValidErr();

  return isHandled;
}
