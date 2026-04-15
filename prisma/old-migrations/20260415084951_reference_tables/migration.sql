-- =============================================================
-- MIGRATION: Replace enums with lookup tables + data migration
-- =============================================================

-- -------------------------------------------------------------
-- 1. RENAME ENUMS FIRST (before creating tables with same names)
-- -------------------------------------------------------------

ALTER TYPE "UserRole"         RENAME TO "UserRoleName";
ALTER TYPE "InvitationStatus" RENAME TO "InvitationStatusName";
ALTER TYPE "ConversationType" RENAME TO "ConversationTypeName";
ALTER TYPE "ParticipantRole"  RENAME TO "ParticipantRoleName";
ALTER TYPE "MessageType"      RENAME TO "MessageTypeName";

-- -------------------------------------------------------------
-- 2. CREATE LOOKUP TABLES
-- -------------------------------------------------------------

CREATE TABLE "UserRole" (
  "id"   BIGINT NOT NULL,
  "name" "UserRoleName" NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

CREATE TABLE "InvitationStatus" (
  "id"   BIGINT NOT NULL,
  "name" "InvitationStatusName" NOT NULL,
  CONSTRAINT "InvitationStatus_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InvitationStatus_name_key" ON "InvitationStatus"("name");

CREATE TABLE "ConversationType" (
  "id"   BIGINT NOT NULL,
  "name" "ConversationTypeName" NOT NULL,
  CONSTRAINT "ConversationType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConversationType_name_key" ON "ConversationType"("name");

CREATE TABLE "ParticipantRole" (
  "id"   BIGINT NOT NULL,
  "name" "ParticipantRoleName" NOT NULL,
  CONSTRAINT "ParticipantRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ParticipantRole_name_key" ON "ParticipantRole"("name");

CREATE TABLE "MessageType" (
  "id"   BIGINT NOT NULL,
  "name" "MessageTypeName" NOT NULL,
  CONSTRAINT "MessageType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessageType_name_key" ON "MessageType"("name");

-- -------------------------------------------------------------
-- 3. SEED LOOKUP TABLES
-- -------------------------------------------------------------

INSERT INTO "UserRole"         ("id", "name") VALUES (1, 'USER'),    (2, 'ADMIN');
INSERT INTO "InvitationStatus" ("id", "name") VALUES (1, 'PENDING'), (2, 'ACCEPTED');
INSERT INTO "ConversationType" ("id", "name") VALUES (1, 'DIRECT'),  (2, 'GROUP');
INSERT INTO "ParticipantRole"  ("id", "name") VALUES (1, 'OWNER'),   (2, 'MEMBER');
INSERT INTO "MessageType"      ("id", "name") VALUES
  (1, 'SYSTEM_CONVERSATION_CREATED'),
  (2, 'SYSTEM_USER_JOINED'),
  (3, 'TEXT');

-- -------------------------------------------------------------
-- 4. ADD NEW FK COLUMNS (nullable for now)
-- -------------------------------------------------------------

ALTER TABLE "User"                    ADD COLUMN "roleId"   BIGINT;
ALTER TABLE "Invitation"              ADD COLUMN "statusId" BIGINT;
ALTER TABLE "Conversation"            ADD COLUMN "typeId"   BIGINT;
ALTER TABLE "ConversationParticipant" ADD COLUMN "roleId"   BIGINT;
ALTER TABLE "Message"                 ADD COLUMN "typeId"   BIGINT;

-- -------------------------------------------------------------
-- 5. BACKFILL FK COLUMNS FROM OLD ENUM COLUMNS
-- -------------------------------------------------------------

UPDATE "User"         u  SET "roleId"   = r."id" FROM "UserRole"         r WHERE r."name" = u."role";
UPDATE "Invitation"   i  SET "statusId" = s."id" FROM "InvitationStatus" s WHERE s."name" = i."status";
UPDATE "Conversation" c  SET "typeId"   = t."id" FROM "ConversationType"  t WHERE t."name" = c."type";
UPDATE "ConversationParticipant" cp SET "roleId" = r."id" FROM "ParticipantRole" r WHERE r."name" = cp."role";
UPDATE "Message"      m  SET "typeId"   = t."id" FROM "MessageType"       t WHERE t."name" = m."type";

-- -------------------------------------------------------------
-- 6. SET NOT NULL + ADD FK CONSTRAINTS
-- -------------------------------------------------------------

ALTER TABLE "User"                    ALTER COLUMN "roleId"   SET NOT NULL;
ALTER TABLE "Invitation"              ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "Conversation"            ALTER COLUMN "typeId"   SET NOT NULL;
ALTER TABLE "ConversationParticipant" ALTER COLUMN "roleId"   SET NOT NULL;
ALTER TABLE "Message"                 ALTER COLUMN "typeId"   SET NOT NULL;

ALTER TABLE "User"
  ADD CONSTRAINT "User_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "UserRole"("id");

ALTER TABLE "Invitation"
  ADD CONSTRAINT "Invitation_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "InvitationStatus"("id");

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_typeId_fkey"
  FOREIGN KEY ("typeId") REFERENCES "ConversationType"("id");

ALTER TABLE "ConversationParticipant"
  ADD CONSTRAINT "ConversationParticipant_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "ParticipantRole"("id");

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_typeId_fkey"
  FOREIGN KEY ("typeId") REFERENCES "MessageType"("id");

-- -------------------------------------------------------------
-- 7. DROP OLD ENUM COLUMNS
-- -------------------------------------------------------------

ALTER TABLE "User"                    DROP COLUMN "role";
ALTER TABLE "Invitation"              DROP COLUMN "status";
ALTER TABLE "Conversation"            DROP COLUMN "type";
ALTER TABLE "ConversationParticipant" DROP COLUMN "role";
ALTER TABLE "Message"                 DROP COLUMN "type";

-- -------------------------------------------------------------
-- 8. FIX ConversationParticipant.id — ensure BIGINT
-- -------------------------------------------------------------

ALTER TABLE "ConversationParticipant"
  ALTER COLUMN "id" TYPE BIGINT;
