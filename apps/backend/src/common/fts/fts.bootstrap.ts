import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/**
 * Applies the FTS5 virtual table + sync triggers on startup, then backfills
 * any items that are missing from the index.
 *
 * Statements are kept as an array rather than parsed from item_fts.sql to
 * avoid splitting trigger bodies on their inner semicolons. The .sql file
 * under prisma/sql/ is the human-readable source of truth / documentation.
 *
 * All DDL statements use IF NOT EXISTS — fully idempotent.
 */
@Injectable()
export class FtsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(FtsBootstrapService.name);

  // Each element is one complete SQL statement (no trailing semicolon needed
  // for $executeRawUnsafe).
  private readonly DDL_STATEMENTS = [
    `CREATE VIRTUAL TABLE IF NOT EXISTS item_fts USING fts5(
      title, url, body, item_id UNINDEXED, tokenize = 'porter unicode61'
    )`,

    `CREATE TRIGGER IF NOT EXISTS item_fts_ai AFTER INSERT ON item BEGIN
      INSERT INTO item_fts(title, url, body, item_id)
      VALUES (new.title, new.url, '', new.id);
    END`,

    `CREATE TRIGGER IF NOT EXISTS item_fts_au AFTER UPDATE ON item BEGIN
      UPDATE item_fts SET title = new.title, url = new.url WHERE item_id = new.id;
    END`,

    `CREATE TRIGGER IF NOT EXISTS item_fts_ad AFTER DELETE ON item BEGIN
      DELETE FROM item_fts WHERE item_id = old.id;
    END`,

    `CREATE TRIGGER IF NOT EXISTS article_fts_ai AFTER INSERT ON article BEGIN
      UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
    END`,

    `CREATE TRIGGER IF NOT EXISTS article_fts_au AFTER UPDATE ON article BEGIN
      UPDATE item_fts SET body = new.contentText WHERE item_id = new.itemId;
    END`,
  ] as const;

  private readonly BACKFILL_SQL = `
    INSERT INTO item_fts(title, url, body, item_id)
    SELECT i.title, i.url, COALESCE(a.contentText, ''), i.id
    FROM item i LEFT JOIN article a ON a.itemId = i.id
    WHERE i.id NOT IN (SELECT item_id FROM item_fts)
  `;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      for (const stmt of this.DDL_STATEMENTS) {
        await this.prisma.$executeRawUnsafe(stmt);
      }
      this.logger.log('FTS5 virtual table and triggers ready');
    } catch (error) {
      // better-sqlite3 ships FTS5; this guard fires only if the SQLite build
      // lacks the extension (e.g. a stripped system SQLite).
      this.logger.error(
        'FTS5 setup failed — FTS5 may be unavailable in this SQLite build. Search will not work.',
        error,
      );
      return;
    }

    try {
      await this.prisma.$executeRawUnsafe(this.BACKFILL_SQL);
      this.logger.log('FTS5 backfill complete');
    } catch (error) {
      this.logger.error('FTS5 backfill failed', error);
    }
  }
}
