-- -------------------------------------------------------------
-- SEED LOOKUP TABLES
-- -------------------------------------------------------------

INSERT INTO "UserRole"         ("id", "name") VALUES (1, 'ADMIN'),               (2, 'USER');
INSERT INTO "InvitationStatus" ("id", "name") VALUES (1, 'PENDING'),             (2, 'ACCEPTED');
INSERT INTO "ConversationType" ("id", "name") VALUES (1, 'DIRECT'),              (2, 'GROUP');
INSERT INTO "ConversationParticipantRole"  ("id", "name") VALUES (1, 'OWNER'),   (2, 'MEMBER');
INSERT INTO "MessageType"      ("id", "name") VALUES
  (1, 'SYSTEM_CONVERSATION_CREATED'),
  (2, 'SYSTEM_USER_JOINED'),
  (3, 'TEXT');
