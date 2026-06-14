/**
 * Highlight domain types — kept in a plain .ts module (not the SFC) so
 * cross-package consumers can import them without tripping
 * typescript-eslint's projectService, which resolves .vue type exports to an
 * error type when the emitting package is outside the consumer's tsconfig
 * project graph.
 */

export type AppHighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface AppHighlightData {
  id: string;
  quote: string;
  prefix: string;
  suffix: string;
  color: AppHighlightColor;
}

export interface AppHighlightCardHighlight extends AppHighlightData {
  note?: string | null;
}
