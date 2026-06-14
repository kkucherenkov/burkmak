-- CreateTable
CREATE TABLE "article" (
    "itemId" TEXT NOT NULL PRIMARY KEY,
    "contentHtml" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "readingTimeMin" INTEGER NOT NULL,
    "extractedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "article_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '',
    "suffix" TEXT NOT NULL DEFAULT '',
    "note" TEXT,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "highlight_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "title" TEXT,
    "siteName" TEXT,
    "excerpt" TEXT,
    "leadImageUrl" TEXT,
    "faviconUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "readState" TEXT NOT NULL DEFAULT 'unread',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "extractStatus" TEXT NOT NULL DEFAULT 'none'
);
INSERT INTO "new_item" ("canonicalUrl", "excerpt", "faviconUrl", "favorite", "id", "leadImageUrl", "readAt", "readState", "savedAt", "siteName", "status", "title", "updatedAt", "url", "userId") SELECT "canonicalUrl", "excerpt", "faviconUrl", "favorite", "id", "leadImageUrl", "readAt", "readState", "savedAt", "siteName", "status", "title", "updatedAt", "url", "userId" FROM "item";
DROP TABLE "item";
ALTER TABLE "new_item" RENAME TO "item";
CREATE INDEX "item_userId_readState_idx" ON "item"("userId", "readState");
CREATE INDEX "item_userId_savedAt_idx" ON "item"("userId", "savedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "highlight_itemId_userId_idx" ON "highlight"("itemId", "userId");
