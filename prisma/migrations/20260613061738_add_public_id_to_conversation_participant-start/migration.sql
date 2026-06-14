/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ConversationParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `ConversationParticipant` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column as nullable
ALTER TABLE "ConversationParticipant"
  ADD COLUMN "publicId" UUID;
