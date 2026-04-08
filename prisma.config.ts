import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({
  path: `${__dirname}/.env.${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`,
});

console.log('hello');
console.log(env('DATABASE_URL'), process.env.NODE_ENV);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
