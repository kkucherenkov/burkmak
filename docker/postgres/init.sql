-- Runs once on first boot of the postgres:18.1-alpine volume.
-- Prisma owns all domain DDL; this file is for extensions/roles only.

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
