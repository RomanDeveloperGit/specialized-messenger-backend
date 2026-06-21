/*
  Warnings:

  - The values [REVOKED] on the enum `PushSubscriptionStatusName` will be removed. If these variants are still used in the database, this will fail.

*/
BEGIN;

-- переносим существующие данные со старого значения на новое
UPDATE "PushSubscriptionStatus"
SET "name" = 'UNSUBSCRIBED'
WHERE "name" = 'REVOKED';

-- AlterEnum
CREATE TYPE "PushSubscriptionStatusName_new" AS ENUM ('ACTIVE', 'EXPIRED', 'UNSUBSCRIBED');
ALTER TABLE "PushSubscriptionStatus" ALTER COLUMN "name" TYPE "PushSubscriptionStatusName_new" USING ("name"::text::"PushSubscriptionStatusName_new");
ALTER TYPE "PushSubscriptionStatusName" RENAME TO "PushSubscriptionStatusName_old";
ALTER TYPE "PushSubscriptionStatusName_new" RENAME TO "PushSubscriptionStatusName";
DROP TYPE "public"."PushSubscriptionStatusName_old";

COMMIT;
