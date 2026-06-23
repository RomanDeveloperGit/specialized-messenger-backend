/*
  Warnings:

  - Added the required column `userAgent` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "userAgent" VARCHAR(255) NOT NULL;
