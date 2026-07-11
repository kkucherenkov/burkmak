-- Hand-written: `prisma migrate dev` refuses to diff this database because the
-- FTS5 virtual tables (item_fts*) live outside schema.prisma (created
-- idempotently by FtsBootstrapService at startup), which its drift detector
-- reads as "reset required". `prisma migrate deploy` applies this file without
-- a drift check, matching how the container applies migrations.

-- AlterTable
ALTER TABLE "article" ADD COLUMN "coverImageKey" TEXT;
