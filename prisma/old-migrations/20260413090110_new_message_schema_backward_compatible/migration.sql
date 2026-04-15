-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('SYSTEM_CONVERSATION_CREATED', 'SYSTEM_USER_JOINED', 'TEXT');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contentV2" JSONB,
ADD COLUMN     "senderId" INTEGER,
ADD COLUMN     "type" "MessageType";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
