import { Credentials } from './credentials.types';

export const parseAuthorizationHeader = (rawHeader: string): Credentials | null => {
  const header = Buffer.from(rawHeader.substring(6), 'base64').toString('utf-8');
  const [login, password] = header.split(':');

  if (!login || !password) {
    return null;
  }

  return {
    login,
    password,
  };
};
