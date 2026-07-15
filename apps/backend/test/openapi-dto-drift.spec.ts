import { readFileSync } from 'node:fs';
import path from 'node:path';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { parse } from 'yaml';
import { describe, it, expect } from 'vitest';

import { ExportMarkdownDto } from '../src/modules/export/application/dto/export-markdown.dto';
import { ListItemsDto } from '../src/modules/items/application/dto/list-items.dto';

/**
 * Guards the hand-maintained mirror between openapi.yaml's query parameters and
 * the DTOs the global ValidationPipe validates against.
 *
 * This is not hypothetical: `GET /items?kind=` shipped returning 400 because the
 * spec declared `kind` and ListItemsDto did not. express-openapi-validator let the
 * request through; `forbidNonWhitelisted` then rejected the undeclared property.
 *
 * Reads the tracked YAML source, not dist/openapi.json — the bundle is gitignored.
 */

// Every operationId whose query parameters are validated by a DTO. A new
// query-bearing endpoint MUST be added here; Step 6 asserts none is missing.
const OPERATION_DTOS: Record<string, new () => object> = {
  listItems: ListItemsDto,
  exportMarkdownBundle: ExportMarkdownDto,
};

/**
 * Operations whose query params are read via individual `@Query('key')`
 * decorators rather than a DTO class. Nest hands the pipe a primitive
 * metatype for those, so `forbidNonWhitelisted` never engages and an
 * undeclared param is ignored rather than rejected — the drift this guard
 * catches cannot occur, because there is no DTO to drift from.
 *
 * getOpdsFeed is deliberate, not an oversight: "OPDS devices are hard to
 * debug, so the feed never 400s on paging" (openapi.yaml:1572), implemented
 * by the per-param @Query in kobo.controller.ts:85-89.
 *
 * Only add an entry here with that same justification — a route that DOES
 * bind a DTO belongs in OPERATION_DTOS.
 */
const NO_DTO_OPERATIONS = new Set<string>(['getOpdsFeed']);

const SPEC_PATH = path.resolve(__dirname, '../../../packages/specs/openapi/openapi.yaml');

interface SpecParam {
  name: string;
  in: string;
}
interface SpecOperation {
  operationId?: string;
  parameters?: SpecParam[];
}

/** operationId -> its `in: query` parameter names, straight from the spec. */
function queryParamsByOperation(): Map<string, string[]> {
  const spec = parse(readFileSync(SPEC_PATH, 'utf8')) as {
    paths: Record<string, Record<string, SpecOperation>>;
  };
  const result = new Map<string, string[]>();
  for (const methods of Object.values(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (method === 'parameters' || !op.operationId) continue;
      const names = (op.parameters ?? []).filter((p) => p.in === 'query').map((p) => p.name);
      if (names.length > 0) result.set(op.operationId, names);
    }
  }
  return result;
}

/**
 * True when the DTO does not declare `param` at all.
 *
 * Checks specifically for the `whitelistValidation` constraint: a param the DTO
 * DOES declare but whose sample value fails its own rule yields `isIn`/`isString`
 * instead, so the probe value never matters.
 */
async function isUndeclared(Dto: new () => object, param: string): Promise<boolean> {
  const errors = await validate(plainToInstance(Dto, { [param]: 'probe' }), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.some((e) => e.property === param && e.constraints?.['whitelistValidation']);
}

describe('openapi.yaml <-> query DTO drift', () => {
  const specParams = queryParamsByOperation();

  for (const [operationId, Dto] of Object.entries(OPERATION_DTOS)) {
    it(`${operationId}: DTO declares every query parameter in the spec`, async () => {
      const params = specParams.get(operationId);
      expect(params, `${operationId} has no query params in the spec`).toBeDefined();

      const undeclared: string[] = [];
      for (const param of params ?? []) {
        if (await isUndeclared(Dto, param)) undeclared.push(param);
      }
      expect(undeclared, `${Dto.name} is missing: ${undeclared.join(', ')}`).toEqual([]);
    });
  }

  it('every query-bearing operation is registered or explicitly exempt', () => {
    const unregistered = [...specParams.keys()].filter(
      (id) => !(id in OPERATION_DTOS) && !NO_DTO_OPERATIONS.has(id),
    );
    expect(unregistered, `add these to OPERATION_DTOS: ${unregistered.join(', ')}`).toEqual([]);
  });
});
