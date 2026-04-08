import { IsString, MinLength } from 'class-validator';

import { GetUserByCredentialsRequest } from '@/modules/user/dto/get-user-by-credentials.dto';

import { AuthorizedUser } from './authorized-user.dto';

export class SignInRequest implements GetUserByCredentialsRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SignInResponse extends AuthorizedUser {}
