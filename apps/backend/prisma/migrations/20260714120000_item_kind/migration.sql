-- Hand-written: `prisma migrate dev` refuses to diff this database because the
-- FTS5 virtual tables (item_fts*) live outside schema.prisma (created
-- idempotently by FtsBootstrapService at startup), which its drift detector
-- reads as "reset required". `prisma migrate deploy` applies this file without
-- a drift check, matching how the container applies migrations.

-- AlterTable
ALTER TABLE "item" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'article';

-- CreateIndex
CREATE INDEX "item_userId_kind_idx" ON "item"("userId", "kind");
