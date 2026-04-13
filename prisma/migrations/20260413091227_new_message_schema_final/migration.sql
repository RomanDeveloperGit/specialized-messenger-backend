/*
  Warnings:

  - You are about to drop the column `contentV2` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - Changed the type of `content` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `type` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable

-- 1. удалить временные поля
ALTER TABLE "Message"
DROP COLUMN "contentV2",
DROP COLUMN "userId";

-- 2. преобразовать content -> JSONB
ALTER TABLE "Message"
ALTER COLUMN "content" TYPE JSONB
USING jsonb_build_object('text', "content");

-- 3. сделать type обязательным (если данные уже заполнены)
ALTER TABLE "Message"
ALTER COLUMN "type" SET NOT NULL;
