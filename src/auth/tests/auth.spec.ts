import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import axios from 'Axios';
import { PrismaService } from '../../prisma.service';
axios.defaults.baseURL = 'http://localhost:4000';

describe('Auth Endpoints', () => {
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await clearDatabaseData(prismaService);
    await createUser('test@abc.com', 'test', prismaService);
  });

  it('login should fail generically (bad input)', async () => {
    const res = await login('asdf', 'Asdf', true);
    expect(res.response.status).toBe(401);
    expect(res.response.data.statusCode).toBe(401);
    expect(res.response.data.message).toMatch(/unauthorized/i);
  });

  it('login should fail generically (bad user)', async () => {
    const res = await login('asdf', 'Asdf');
    expect(res.response.status).toBe(401);
    expect(res.response.data.statusCode).toBe(401);
    expect(res.response.data.message).toMatch(/unauthorized/i);
  });

  it('login should fail generically (good user, bad pw)', async () => {
    const res = await login('test@abc.com', 'Asdf');
    expect(res.response.status).toBe(401);
    expect(res.response.data.statusCode).toBe(401);
    expect(res.response.data.message).toMatch(/unauthorized/i);
  });

  it('login should pass (good user, good pw)', async () => {
    const res = await login('test@abc.com', 'test');
    expect(res.status).toBe(201);
    expect(res.data.email).toBe('test@abc.com');
    expect(res.data.createdBy).toBe('test');
    expect(res.data.updatedBy).toBe('test');
    expect(res.data.token).toBeTruthy();
  });
});

async function login(email: string, password: string, bad = false) {
  const data = bad ? { asdf: 'bad input' } : { email, password };
  return await axios.post('/auth/login', data).catch((err) => err);
}

async function createUser(
  email: string,
  password: string,
  prismaService: PrismaService,
) {
  const newHash = await argon2.hash(password);
  await prismaService.users.create({
    data: {
      email: email,
      phash: newHash,
      createdBy: 'test',
      updatedBy: 'test',
    },
  });
}

async function clearDatabaseData(prisma: PrismaService) {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const blackList = ['_prisma_migrations', 'Permissions', 'Roles'];
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => !blackList.includes(name))
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}
