-- prisma/migrations/<timestamp>_seed_push_subscription_status/migration.sql

INSERT INTO "PushSubscriptionStatus" ("id", "name", "createdAt")
VALUES
  (1, 'ACTIVE',  now()),
  (2, 'EXPIRED', now()),
  (3, 'REVOKED', now())
ON CONFLICT ("id") DO NOTHING;
