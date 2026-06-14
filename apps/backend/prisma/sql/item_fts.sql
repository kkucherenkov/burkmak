-- FTS5 virtual table for full-text search over items + article body.
-- This file is documentation only. The actual DDL is applied at bootstrap
-- by apps/backend/src/common/fts/fts.bootstrap.ts using an embedded
-- statement array to avoid splitting trigger bodies on inner semicolons.

CREATE VIRTUAL TABLE IF NOT EXISTS item_fts USING fts5(
  title, url, body, item_id UNINDEXED, tokenize = 'porter unicode61'
);

-- Sync triggers on `item`
CREATE TRIGGER IF NOT EXISTS item_fts_ai AFTER INSERT ON item BEGIN
  INSERT INTO item_fts(title, url, body, item_id)
  VALUES (new.title, new.url, '', new.id);
END;

CREATE TRIGGER IF NOT EXISTS item_fts_au AFTER UPDATE ON item BEGIN
  UPDATE item_fts SET title = new.title, url = new.url WHERE item_id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS item_fts_ad AFTER DELETE ON item BEGIN
  DELETE FROM item_fts WHERE item_id = old.id;
END;

-- Sync triggers on `article`
CREATE TRIGGER IF NOT EXISTS article_fts_ai AFTER INSERT ON article BEGIN
  UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
END;

CREATE TRIGGER IF NOT EXISTS article_fts_au AFTER UPDATE ON article BEGIN
  UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
END;
