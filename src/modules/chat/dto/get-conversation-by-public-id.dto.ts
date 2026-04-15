import { IsUUID } from 'class-validator';

import { PublicId } from '@/shared/libs/ids';

export class GetConversationByPublicIdParams {
  @IsUUID()
  id: PublicId;
}
