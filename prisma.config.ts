import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({
  path: `${__dirname}/.env.${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`,
});

console.log(process.env.DATABASE_URL);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
