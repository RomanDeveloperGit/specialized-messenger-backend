import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const abc = {};

dotenv.config({
  // processEnv: abc,
  path: `${__dirname}/.env.${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`,
});

console.log(process.env.NODE_ENV, typeof process.env.DATABASE_URL, process.env.DATABASE_URL, abc);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
