import { Config } from './config.types';

type ConfigFactory = () => Config;

export const configFactory: ConfigFactory = () => {
  return {
    httpPort: Number(process.env.HTTP_PORT),
    wsPort: Number(process.env.WS_PORT),
    consumerOrigin: String(process.env.CONSUMER_ORIGIN),
    hasDocs: process.env.HAS_DOCS === 'true',
    databaseUrl: String(process.env.DATABASE_URL),
    passwordHashSalt: Number(process.env.PASSWORD_HASH_SALT),
  };
};
