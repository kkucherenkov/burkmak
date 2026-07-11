-- Hand-written (same reason as 20260711120000): the startup-managed FTS5
-- virtual tables trip `prisma migrate dev`'s drift detector; `migrate deploy`
-- applies this file without a drift check.

-- CreateTable
CREATE TABLE "kobo_entitlement" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kobo_entitlement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kobo_reading_state" (
    "itemId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "statusInfo" TEXT NOT NULL,
    "statistics" TEXT,
    "currentBookmark" TEXT,
    "priorityTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" DATETIME NOT NULL,
    CONSTRAINT "kobo_reading_state_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "kobo_entitlement_itemId_key" ON "kobo_entitlement"("itemId");
