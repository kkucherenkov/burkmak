import { test, expect } from '@playwright/test';

/**
 * Real end-to-end flow against the Docker stack (web :3001 + backend :3000):
 * sign up → land on the guarded /library → save a link → watch it go
 * pending → ready over SSE. This exercises Better Auth, the items API, the
 * job worker + metadata fetch, the SSE stream, and the Nuxt UI together.
 *
 * A fresh email per run keeps it idempotent against the persisted SQLite db.
 */

// Unique-but-deterministic-per-run email (no Date.now in module scope issues here — test runtime is fine).
function uniqueEmail(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `e2e_${rand}@example.com`;
}

test('sign up, land on library, save a link, see it resolve via SSE', async ({ page }) => {
  const email = uniqueEmail();
  const password = 'hunter22!A';

  // --- sign up ---
  await page.goto('/sign-up');
  await page.locator('input[autocomplete="name"]').fill('E2E Tester');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /create account|создать/i }).click();

  // --- guard routes us to the library ---
  await page.waitForURL('**/library', { timeout: 15_000 });
  await expect(page.locator('.page-library')).toBeVisible();

  // --- save a link via the inline add bar ---
  await page.locator('.app-add-bar input[type="url"]').fill('https://example.com/');
  await page.locator('.app-add-bar').getByRole('button').click();

  // --- the item appears (pending first) ---
  const card = page.locator('.app-item-card').first();
  await expect(card).toBeVisible({ timeout: 10_000 });

  // --- and resolves to ready via SSE: the pending status badge disappears
  //     (AppStatusBadge renders only while status !== 'ready') ---
  await expect(card.locator('.app-status-badge')).toHaveCount(0, { timeout: 20_000 });
});
