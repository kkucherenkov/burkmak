export interface ExportFilters {
  readState?: 'unread' | 'read' | 'archived';
  includeEmpty?: boolean;
}

export function buildExportUrl(base: string, filters: ExportFilters): string {
  const normalizedBase = base.replace(/\/$/, '');
  const url = `${normalizedBase}/export/markdown`;

  const params = new URLSearchParams();

  if (filters.readState) {
    params.set('readState', filters.readState);
  }

  if (filters.includeEmpty === true) {
    params.set('includeEmpty', 'true');
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}
