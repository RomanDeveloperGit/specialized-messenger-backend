-- CreateEnum
CREATE TYPE "PushSubscriptionStatusName" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "PushSubscriptionStatus" (
    "id" BIGINT NOT NULL,
    "name" "PushSubscriptionStatusName" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscriptionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "statusId" BIGINT NOT NULL,
    "endpoint" VARCHAR(500) NOT NULL,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "expirationTime" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscriptionStatus_name_key" ON "PushSubscriptionStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_publicId_key" ON "PushSubscription"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_statusId_idx" ON "PushSubscription"("statusId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PushSubscriptionStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
