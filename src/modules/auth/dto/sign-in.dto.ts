import { IsString, MinLength } from 'class-validator';

import { GetUserByCredentialsRequest } from '@/modules/user/dto/get-user-by-credentials.dto';

export class SignInRequest implements GetUserByCredentialsRequest {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}
