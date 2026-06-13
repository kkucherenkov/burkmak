-- CreateTable
CREATE TABLE "item" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "item_tag" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("itemId", "tagId"),
    CONSTRAINT "item_tag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "item_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "item_userId_readState_idx" ON "item"("userId", "readState");

-- CreateIndex
CREATE INDEX "item_userId_savedAt_idx" ON "item"("userId", "savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "tag_userId_slug_key" ON "tag"("userId", "slug");
