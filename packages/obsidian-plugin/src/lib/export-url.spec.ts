import { describe, expect, it } from 'vitest';
import { buildExportUrl } from './export-url';

describe('buildExportUrl', () => {
  it('joins base + path + filters, trimming trailing slash', () => {
    expect(buildExportUrl('http://h/api/v1/', { readState: 'unread', includeEmpty: false })).toBe(
      'http://h/api/v1/export/markdown?readState=unread',
    );
  });
  it('omits empty filters; adds includeEmpty only when true', () => {
    expect(buildExportUrl('http://h/api/v1', {})).toBe('http://h/api/v1/export/markdown');
    expect(buildExportUrl('http://h/api/v1', { includeEmpty: true })).toBe(
      'http://h/api/v1/export/markdown?includeEmpty=true',
    );
  });
});
