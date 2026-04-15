/*
  Warnings:

  - You are about to alter the column `name` on the `Conversation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `firstName` on the `Invitation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Invitation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `login` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
CREATE SEQUENCE conversation_id_seq;
ALTER TABLE "Conversation" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "id" SET DEFAULT nextval('conversation_id_seq');
ALTER SEQUENCE conversation_id_seq OWNED BY "Conversation"."id";

-- AlterTable
CREATE SEQUENCE invitation_id_seq;
ALTER TABLE "Invitation" ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "id" SET DEFAULT nextval('invitation_id_seq');
ALTER SEQUENCE invitation_id_seq OWNED BY "Invitation"."id";

-- AlterTable
CREATE SEQUENCE message_id_seq;
ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT nextval('message_id_seq');
ALTER SEQUENCE message_id_seq OWNED BY "Message"."id";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "login" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);
