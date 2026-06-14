import type { Ref } from 'vue';

import type { components } from '@app/specs';

type Highlight = components['schemas']['Highlight'];
type HighlightColor = components['schemas']['HighlightColor'];
type UpdateHighlightRequest = components['schemas']['UpdateHighlightRequest'];

export interface AddHighlightInput {
  quote: string;
  prefix: string;
  suffix: string;
  color: HighlightColor;
  note?: string;
}

export interface UseHighlightsReturn {
  list: Ref<Highlight[]>;
  load(): Promise<void>;
  add(input: AddHighlightInput): Promise<Highlight>;
  update(hid: string, patch: UpdateHighlightRequest): Promise<void>;
  remove(hid: string): Promise<void>;
}

export function useHighlights(id: string): UseHighlightsReturn {
  const api = useApi();
  const list = useState<Highlight[]>(`highlights:${id}`, () => []);

  async function load(): Promise<void> {
    const result = await api.listHighlights(id);
    list.value = result.highlights;
  }

  async function add(input: AddHighlightInput): Promise<Highlight> {
    const hl = await api.createHighlight(id, input);
    list.value = [...list.value, hl];
    return hl;
  }

  async function update(hid: string, patch: UpdateHighlightRequest): Promise<void> {
    const hl = await api.updateHighlight(hid, patch);
    list.value = list.value.map((h) => (h.id === hid ? hl : h));
  }

  async function remove(hid: string): Promise<void> {
    const prev = list.value;
    list.value = list.value.filter((h) => h.id !== hid);
    try {
      await api.deleteHighlight(hid);
    } catch (error) {
      list.value = prev;
      throw error;
    }
  }

  return { list, load, add, update, remove };
}
