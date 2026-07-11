/**
 * Static Kobo `Resources` map for `GET /v1/initialization`, rewritten to this
 * user's mount. `{ImageId}`, `{Width}`, `{Height}`, `{Quality}`, `{IsGreyscale}`
 * are literal placeholders the DEVICE substitutes at request time — they must
 * NOT be URL-encoded.
 */
export interface InitializationResources {
  Resources: Record<string, string>;
}

export function buildResources(mountBase: string): InitializationResources {
  const imageHost = new URL(mountBase).origin;

  return {
    Resources: {
      image_host: imageHost,
      image_url_template: `${mountBase}/{ImageId}/{Width}/{Height}/false/image.jpg`,
      image_url_quality_template: `${mountBase}/{ImageId}/{Width}/{Height}/{Quality}/{IsGreyscale}/image.jpg`,
      library_sync: `${mountBase}/v1/library/sync`,
    },
  };
}
