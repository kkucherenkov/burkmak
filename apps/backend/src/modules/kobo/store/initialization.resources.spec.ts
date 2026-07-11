import { describe, expect, it } from 'vitest';

import { buildResources } from './initialization.resources';

const MOUNT_BASE = 'https://h/api/v1/kobo/burk_pat_abc123';

describe('buildResources', () => {
  it('rewrites image/library_sync URLs to this mount', () => {
    const { Resources } = buildResources(MOUNT_BASE);

    expect(Resources['image_host']).toBe('https://h');
    expect(Resources['library_sync']).toBe(`${MOUNT_BASE}/v1/library/sync`);
    expect(Resources['image_url_template']).toBe(
      `${MOUNT_BASE}/{ImageId}/{Width}/{Height}/false/image.jpg`,
    );
    expect(Resources['image_url_quality_template']).toBe(
      `${MOUNT_BASE}/{ImageId}/{Width}/{Height}/{Quality}/{IsGreyscale}/image.jpg`,
    );
  });

  it('leaves device-substituted placeholders literal (not URL-encoded)', () => {
    const { Resources } = buildResources(MOUNT_BASE);

    for (const key of ['image_url_template', 'image_url_quality_template']) {
      const url = Resources[key] as string;
      expect(url).toContain('{ImageId}');
      expect(url).toContain('{Width}');
      expect(url).toContain('{Height}');
      expect(url).not.toContain('%7B'); // would appear if braces got percent-encoded
    }
    expect(Resources['image_url_quality_template']).toContain('{Quality}');
    expect(Resources['image_url_quality_template']).toContain('{IsGreyscale}');
  });
});
