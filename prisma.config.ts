import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

console.log(process.env.NODE_ENV);
console.log('hello');

dotenv.config({
  path: `${__dirname}/.env.${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`,
});
console.log(env('DATABASE_URL'));

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
