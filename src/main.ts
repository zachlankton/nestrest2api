import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AllExceptionsFilter } from './exception-handler/exception-handler.filter';
import * as session from 'express-session';
import * as passport from 'passport';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import { Role } from './auth/enums/roles.enum';
import { Permission } from './auth/enums/permissions.enum';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { sendEmail } from './lib/sendgrid';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  if (!process.env.SESSION_SECRET_KEY)
    throw 'SESSION_SECRET_KEY environment variable needs to be set!';
  if (!process.env.ENCRYPTION_KEY)
    throw 'ENCRYPTION_KEY environment variable needs to be set!';
  // if (!process.env.SENDGRID_API)
  //   throw 'SENDGRID_API environment variable needs to be set!';
  // if (!process.env.SENDGRID_FROM)
  //   throw 'SENDGRID_FROM environment variable needs to be set!';
  if (!process.env.DATABASE_URL)
    throw 'DATABASE_URL environment variable needs to be set!';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await syncRolesAndPermissions(prismaService);
  await checkForSuperAdmin(prismaService);
  // app.use(helmet());

  app.use(async (req: any, res: any, next: any) => {
    const bearer = req.headers['authorization'];
    if (!bearer) return next();

    console.log('Using Authorization Header for Session: ' + bearer);
    const session = await prismaService.session.findFirst({
      where: { id: bearer.slice(7) },
    });

    !session &&
      console.log(
        'Authorization Header did not have any valid sessions! ' + bearer,
      );

    if (!session) return next();

    req.session = JSON.parse(session.data);
    next();
  });

  app.set('trust proxy', 1);
  app.use(
    session({
      proxy: true,
      secret: process.env.SESSION_SECRET_KEY,
      cookie: { sameSite: 'strict', secure: 'auto' },
      resave: false,
      saveUninitialized: false,
      store: new PrismaSessionStore(new PrismaClient(), {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.enableVersioning();
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      whitelist: true,
      skipMissingProperties: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestRest 2.0 API')
    .setDescription('')
    .setVersion('')
    .addBearerAuth()
    .build();
  const swoptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace('Controller', '')}_${methodKey}`,
  };
  const document = SwaggerModule.createDocument(app, config, swoptions);
  SwaggerModule.setup('api', app, document);

  await app.listen(+(process.env.SERVER_PORT as unknown as number));
}
bootstrap();

async function syncRolesAndPermissions(prismaService: any) {
  console.log('Synchronize Roles and Permissions!');
  const roles = Object.values(Role);
  for (const role of roles) {
    await prismaService.roles.upsert({
      where: { role },
      update: { role },
      create: { role },
    });
  }

  const permissions = Object.values(Permission);
  for (const permission of permissions) {
    await prismaService.permissions.upsert({
      where: { permission },
      update: { permission },
      create: { permission },
    });
  }
}

async function checkForSuperAdmin(prismaService: PrismaService) {
  const users = await prismaService.users.findMany({
    where: { roles: { some: { role: { equals: 'superAdmin' } } } },
  });
  if (users.length > 0) return true; // a superAdmin exists!

  // init a superAdmin if none exists
  const adminEmail = process.env.SEND_ADMIN_EMAIL || 'nestrest2@admin.com';
  const newPW = 'mysecretpassword'; // randomBytes(32).toString('base64');
  const newHash = await argon2.hash(newPW);
  await prismaService.users.create({
    data: {
      email: adminEmail,
      phash: newHash,
      createdBy: 'main.ts',
      updatedBy: 'main.ts',
      roles: {
        connect: { role: 'superAdmin' },
      },
    },
  });

  if (process.env.SEND_ADMIN_EMAIL) {
    console.log('====SENDING ADMIN EMAIL=====');
    const resp = await sendEmail({
      to: process.env.SEND_ADMIN_EMAIL,
      subject: 'NestRest 2 API Message',
      text: `Super Admin CREATED! \n { "email": "${adminEmail}", "password": "${newPW}" }`,
    }).catch((err) => [err]);
    console.log(resp[0].statusCode);
    if (resp[0].statusCode === 202) return;
  }

  // waiting a little so that this info hopefully doesn't get burried at the top of the logs
  setTimeout(() => {
    console.log('===============================');
    console.log('===============================');
    console.log('===============================');
    console.log(
      `Super Admin CREATED! { "email": "${adminEmail}", "password": "${newPW}" }`,
    );
    console.log(
      '\n PLEASE SAVE THIS OR WRITE THIS DOWN!! IT WILL NOT APPEAR AGAIN!',
    );
    console.log('===============================');
    console.log('===============================');
    console.log('===============================');
  }, 1000);
}
