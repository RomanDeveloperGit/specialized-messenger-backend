import { Config } from './config.types';

type ConfigFactory = () => Config;

export const configFactory: ConfigFactory = () => {
  return {
    port: Number(process.env.PORT),
    hasDocs: process.env.HAS_DOCS === 'true',

    databaseUrl: String(process.env.DATABASE_URL),

    passwordHashSalt: Number(process.env.PASSWORD_HASH_SALT),
  };
};
