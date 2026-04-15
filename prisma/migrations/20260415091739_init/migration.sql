-- CreateEnum
CREATE TYPE "UserRoleName" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "InvitationStatusName" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "ConversationTypeName" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "ConversationParticipantRoleName" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MessageTypeName" AS ENUM ('SYSTEM_CONVERSATION_CREATED', 'SYSTEM_USER_JOINED', 'TEXT');

-- CreateTable
CREATE TABLE "UserRole" (
    "id" BIGINT NOT NULL,
    "name" "UserRoleName" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "login" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "roleId" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationStatus" (
    "id" BIGINT NOT NULL,
    "name" "InvitationStatusName" NOT NULL,

    CONSTRAINT "InvitationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "authorUserId" BIGINT NOT NULL,
    "statusId" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationType" (
    "id" BIGINT NOT NULL,
    "name" "ConversationTypeName" NOT NULL,

    CONSTRAINT "ConversationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "name" VARCHAR(100),
    "typeId" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipantRole" (
    "id" BIGINT NOT NULL,
    "name" "ConversationParticipantRoleName" NOT NULL,

    CONSTRAINT "ConversationParticipantRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" BIGSERIAL NOT NULL,
    "conversationId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "roleId" BIGINT NOT NULL,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageType" (
    "id" BIGINT NOT NULL,
    "name" "MessageTypeName" NOT NULL,

    CONSTRAINT "MessageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" BIGSERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "conversationId" BIGINT NOT NULL,
    "authorUserId" BIGINT,
    "typeId" BIGINT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationStatus_name_key" ON "InvitationStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_publicId_key" ON "Invitation"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationType_name_key" ON "ConversationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_publicId_key" ON "Conversation"("publicId");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipantRole_name_key" ON "ConversationParticipantRole"("name");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageType_name_key" ON "MessageType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Message_publicId_key" ON "Message"("publicId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "InvitationStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConversationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ConversationParticipantRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "MessageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
