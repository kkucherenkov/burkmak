-- Hand-written: `prisma migrate dev` refuses to diff this database because the
-- FTS5 virtual tables (item_fts*) live outside schema.prisma (created
-- idempotently by FtsBootstrapService at startup), which its drift detector
-- reads as "reset required". `prisma migrate deploy` applies this file without
-- a drift check, matching how the container applies migrations.

-- CreateTable
CREATE TABLE "shelf" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "shelf_item" (
    "shelfId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("shelfId", "itemId"),
    CONSTRAINT "shelf_item_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "shelf" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shelf_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "shelf_userId_name_key" ON "shelf"("userId", "name");

-- CreateIndex
CREATE INDEX "shelf_item_itemId_idx" ON "shelf_item"("itemId");
