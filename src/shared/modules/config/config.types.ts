export interface Config {
  httpPort: number;
  wsPort: number;
  consumerOrigin: string;
  hasDocs: boolean;
  databaseUrl: string;
  passwordHashSalt: number;
  vapidSubject: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
}
