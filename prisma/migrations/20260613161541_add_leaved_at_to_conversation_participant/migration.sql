-- AlterEnum
ALTER TYPE "MessageTypeName" ADD VALUE 'SYSTEM_USER_LEAVED';

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "leavedAt" TIMESTAMPTZ;
