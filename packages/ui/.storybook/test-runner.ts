import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

/**
 * Storybook test-runner config for self-hosted visual regression.
 *
 * For every story, after the play function (if any) completes:
 *  1. wait for the preview iframe to settle,
 *  2. screenshot the preview root,
 *  3. compare with `__snapshots__/<story-id>.png`.
 *
 * Baseline images are committed under `packages/ui/test/__snapshots__/`.
 * To refresh: `pnpm --filter @app/ui test:visual -- --ci=false` (interactive)
 * or delete the baseline and re-run.
 */
const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },

  async postVisit(page, context) {
    await waitForPageReady(page);

    // Find the element that wraps the story (Storybook 10 preview iframe).
    const elementHandle = await page.$('#storybook-root');
    if (!elementHandle) return;

    const image = await elementHandle.screenshot({
      animations: 'disabled',
      caret: 'hide',
    });

    // @ts-expect-error — extended via setup()
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: `${process.cwd()}/test/__snapshots__`,
      customSnapshotIdentifier: context.id,
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  },
};

export default config;
