import type { Ref } from 'vue';

import type { components } from '@app/specs';

type Tag = components['schemas']['Tag'];

export interface UseTagsReturn {
  tags: Ref<Tag[]>;
  load(): Promise<void>;
}

export function useTags(): UseTagsReturn {
  const api = useApi();
  const tags = useState<Tag[]>('tags:list', () => []);

  async function load(): Promise<void> {
    const result = await api.getTags();
    tags.value = [...result.tags];
  }

  return { tags, load };
}
