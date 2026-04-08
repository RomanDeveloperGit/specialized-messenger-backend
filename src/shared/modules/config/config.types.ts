export interface Config {
  port: number;
  hasDocs: boolean;

  databaseUrl: string;

  passwordHashSalt: number;
}
