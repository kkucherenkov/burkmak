<script setup lang="ts">
/**
 * burkmak — Library (the core list screen).
 *
 * Near drop-in reference for `@app/ui`. Self-contained: no imports beyond Vue.
 * Styles ONLY through the canonical token contract (tokens.preview.css) —
 * --brand-accent, --surface-page, --text-fg, --radius-*, --space-*, --dur-*, …
 * The component defines NO token values; the host app supplies them and the
 * `theme` prop sets data-theme so the right light/dark set cascades in.
 *
 * Markup stands in for these primitives (extract by root class + comment):
 *   app-filter-bar · app-item-card · app-status-badge · app-tag-chip
 *   app-skeleton · app-empty-state
 */
import { computed, onMounted, ref } from 'vue'

type ReadFilter = 'unread' | 'read' | 'archived' | 'starred'
type ItemStatus = 'ready' | 'pending' | 'extracting' | 'failed'

interface LibraryItem {
  id: string
  title: string
  site: string
  url: string
  savedAt: string
  excerpt: string
  tags: string[]
  status: ItemStatus
  readState: 'unread' | 'read' | 'archived'
  starred: boolean
}

const props = withDefaults(
  defineProps<{
    theme?: 'light' | 'dark'
    initialState?: 'loading' | 'ready'
    initialFilter?: ReadFilter
  }>(),
  { theme: 'light', initialState: 'loading', initialFilter: 'unread' },
)

const SEED: LibraryItem[] = [
  {
    id: 'i1', title: 'The case for reading on paper, on a screen',
    site: 'newyorker.com', url: 'https://newyorker.com/x', savedAt: '2h ago',
    excerpt: 'Screens trained us to skim. A handful of small interface choices can teach them to slow back down — and why that matters for what we keep.',
    tags: ['reading', 'longread'], status: 'ready', readState: 'unread', starred: true,
  },
  {
    id: 'i2', title: 'Self-hosting your read-it-later, end to end',
    site: 'arstechnica.com', url: 'https://arstechnica.com/x', savedAt: '5h ago',
    excerpt: 'A walkthrough of running an extraction pipeline on a small box at home, from article fetch to a clean reader view, with sync to an e-reader.',
    tags: ['selfhosted', 'devops'], status: 'pending', readState: 'unread', starred: false,
  },
  {
    id: 'i3', title: 'How Kobo sideloading actually works',
    site: 'mobileread.com', url: 'https://mobileread.com/x', savedAt: '8h ago',
    excerpt: 'The file formats, the folder the device watches, and the metadata that decides whether your saved articles show up as a tidy collection or a mess.',
    tags: ['kobo', 'sync'], status: 'extracting', readState: 'unread', starred: false,
  },
  {
    id: 'i4', title: 'Exporting highlights to Obsidian without the cruft',
    site: 'obsidian.md', url: 'https://obsidian.md/x', savedAt: 'Yesterday',
    excerpt: 'Markdown export looks simple until footnotes, callouts, and block references get involved. A small template keeps your notes clean on the way out.',
    tags: ['obsidian', 'notes'], status: 'ready', readState: 'unread', starred: false,
  },
  {
    id: 'i5', title: 'A field guide to warm, low-glare dark modes',
    site: 'smashingmagazine.com', url: 'https://smashingmagazine.com/x', savedAt: '2d ago',
    excerpt: 'Pure black is rarely the right answer for long reading. Warming the ink and the paper reduces glare without the muddy contrast of a flat grey theme.',
    tags: ['design', 'reading'], status: 'ready', readState: 'read', starred: true,
  },
  {
    id: 'i6', title: 'Why your saved articles never finished downloading',
    site: 'github.blog', url: 'https://github.blog/x', savedAt: '3d ago',
    excerpt: '',
    tags: ['devops'], status: 'failed', readState: 'unread', starred: false,
  },
  {
    id: 'i7', title: 'Notes on building a calmer inbox for the things you mean to read',
    site: 'craigmod.com', url: 'https://craigmod.com/x', savedAt: '4d ago',
    excerpt: 'The hardest part of a reading queue is not collecting — it is forgetting gracefully. A library should feel like a shelf, not a backlog that nags.',
    tags: ['reading', 'product'], status: 'ready', readState: 'read', starred: false,
  },
]

const STATUS_LABEL: Record<ItemStatus, string> = {
  pending: 'Saving',
  extracting: 'Extracting',
  ready: 'Ready',
  failed: 'Failed',
}

const SEGMENTS: Array<{ key: ReadFilter; label: string; star?: boolean }> = [
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'archived', label: 'Archived' },
  { key: 'starred', label: 'Favorite', star: true },
]

const items = ref<LibraryItem[]>([...SEED])
const loading = ref(props.initialState === 'loading')
const filter = ref<ReadFilter>(props.initialFilter)
const activeTag = ref('all')
const query = ref('')

onMounted(() => {
  if (props.initialState !== 'loading') return
  // Simulated fetch so the skeleton state is reachable from real data.
  window.setTimeout(() => { loading.value = false }, 900)
})

const tags = computed(() =>
  Array.from(new Set(items.value.flatMap((i) => i.tags))).sort(),
)

const counts = computed<Record<ReadFilter, number>>(() => ({
  unread: items.value.filter((i) => i.readState === 'unread').length,
  read: items.value.filter((i) => i.readState === 'read').length,
  archived: items.value.filter((i) => i.readState === 'archived').length,
  starred: items.value.filter((i) => i.starred).length,
}))

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter((i) => {
    const matchesFilter = filter.value === 'starred' ? i.starred : i.readState === filter.value
    if (!matchesFilter) return false
    if (activeTag.value !== 'all' && !i.tags.includes(activeTag.value)) return false
    if (q && !`${i.title} ${i.site} ${i.excerpt}`.toLowerCase().includes(q)) return false
    return true
  })
})

const empty = computed(() => {
  const q = query.value.trim()
  if (q) {
    return { title: 'No matches', text: `Nothing matches “${q}”. Try a different word or clear the search.`, cta: 'Clear search' }
  }
  if (activeTag.value !== 'all') {
    return { title: 'No items here', text: `Nothing tagged #${activeTag.value} in this view yet.`, cta: '' }
  }
  switch (filter.value) {
    case 'archived':
      return { title: 'Nothing archived yet', text: 'Articles you archive rest here, out of the way but never gone.', cta: '' }
    case 'read':
      return { title: 'Nothing read yet', text: 'Finished articles move here so your unread list stays calm.', cta: '' }
    case 'starred':
      return { title: 'No favorites yet', text: 'Star an article to keep it close — favorites collect here.', cta: '' }
    default:
      return { title: 'Nothing here yet', text: 'Paste a link to start your library. burkmak fetches a clean reader view and keeps it for later.', cta: 'Paste a link' }
  }
})

const isFetching = (s: ItemStatus) => s === 'pending' || s === 'extracting'
const initial = (site: string) => site.charAt(0).toUpperCase()

function setFilter(next: ReadFilter) { filter.value = next }
function archive(id: string) {
  items.value = items.value.map((i) => (i.id === id ? { ...i, readState: 'archived' } : i))
}
function toggleStar(id: string) {
  items.value = items.value.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i))
}
function remove(id: string) {
  items.value = items.value.filter((i) => i.id !== id)
}
function retry(id: string) {
  items.value = items.value.map((i) => (i.id === id ? { ...i, status: 'extracting' } : i))
  window.setTimeout(() => {
    items.value = items.value.map((i) =>
      i.id === id ? { ...i, status: 'ready', excerpt: 'Fetched on retry — the reader view is ready to open.' } : i,
    )
  }, 1100)
}
function clearSearch() { query.value = '' }
</script>

<template>
  <div class="app-library" :data-theme="theme">
    <div class="app-library__inner">
      <header class="app-library__head">
        <h1 class="app-library__title">Library</h1>
        <span class="app-library__count">
          {{ loading ? 'Loading…' : `${visible.length} ${visible.length === 1 ? 'item' : 'items'}` }}
        </span>
      </header>

      <!-- @app/ui: AppFilterBar -->
      <div class="app-filter-bar" role="toolbar" aria-label="Filter library">
        <div class="app-filter-bar__seg" role="group" aria-label="Read state">
          <button
            v-for="seg in SEGMENTS"
            :key="seg.key"
            type="button"
            class="app-filter-bar__seg-btn"
            :aria-pressed="filter === seg.key"
            @click="setFilter(seg.key)"
          >
            <svg v-if="seg.star" class="app-filter-bar__seg-icon" viewBox="0 0 24 24" width="15" height="15"
              fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L4.5 9.7l5.9-.8z" />
            </svg>
            <span>{{ seg.label }}</span>
            <span class="app-filter-bar__count">{{ counts[seg.key] }}</span>
          </button>
        </div>

        <span class="app-filter-bar__spacer" />

        <label class="app-select">
          <span class="app-sr-only">Filter by tag</span>
          <select v-model="activeTag" class="app-select__control">
            <option value="all">All tags</option>
            <option v-for="tag in tags" :key="tag" :value="tag">#{{ tag }}</option>
          </select>
          <svg class="app-select__caret" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </label>

        <span class="app-search">
          <svg class="app-search__icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input v-model="query" class="app-search__control" type="search" placeholder="Search library" aria-label="Search library" />
        </span>
      </div>

      <!-- Skeleton (loading) -->
      <div v-if="loading" class="app-list" aria-busy="true" aria-label="Loading saved items">
        <!-- @app/ui: AppSkeleton (AppItemCard skeleton) -->
        <article v-for="n in 5" :key="n" class="app-item-card app-item-card--skeleton" aria-hidden="true">
          <span class="app-skeleton app-skeleton--favicon" />
          <div class="app-item-card__body">
            <span class="app-skeleton app-skeleton--title" />
            <span class="app-skeleton app-skeleton--meta" />
            <span class="app-skeleton app-skeleton--line app-skeleton--w90" />
            <span class="app-skeleton app-skeleton--line app-skeleton--w70" />
          </div>
          <span />
        </article>
      </div>

      <!-- Populated list -->
      <div v-else-if="visible.length" class="app-list">
        <!-- @app/ui: AppItemCard -->
        <article
          v-for="item in visible"
          :key="item.id"
          class="app-item-card"
          :class="{ 'app-item-card--starred': item.starred }"
        >
          <span class="app-item-card__favicon" aria-hidden="true">{{ initial(item.site) }}</span>

          <div class="app-item-card__body">
            <div class="app-item-card__title-row">
              <h3 class="app-item-card__title">{{ item.title }}</h3>
              <!-- @app/ui: AppStatusBadge -->
              <span
                v-if="item.status !== 'ready'"
                class="app-status-badge"
                :class="`app-status-badge--${item.status}`"
              >
                <span class="app-status-badge__dot" aria-hidden="true" />
                {{ STATUS_LABEL[item.status] }}
              </span>
            </div>

            <div class="app-item-card__meta">
              <span>{{ item.site }}</span>
              <span class="app-item-card__sep" aria-hidden="true" />
              <span>{{ item.savedAt }}</span>
            </div>

            <div v-if="isFetching(item.status)" class="app-item-card__fetching" role="status" aria-label="Fetching article">
              <span class="app-skeleton app-skeleton--line app-skeleton--w90" />
              <span class="app-skeleton app-skeleton--line app-skeleton--w70" />
            </div>
            <p v-else-if="item.status === 'failed'" class="app-item-card__excerpt app-item-card__excerpt--failed">
              <span>We couldn’t fetch this article.</span>
              <button type="button" class="app-item-card__retry" @click="retry(item.id)">Retry</button>
            </p>
            <p v-else class="app-item-card__excerpt">{{ item.excerpt }}</p>

            <div v-if="item.tags.length" class="app-item-card__tags">
              <!-- @app/ui: AppTagChip -->
              <span v-for="tag in item.tags" :key="tag" class="app-tag-chip">#{{ tag }}</span>
            </div>
          </div>

          <div class="app-item-card__actions">
            <button
              type="button"
              class="app-icon-btn"
              :class="{ 'app-icon-btn--on': item.starred }"
              :aria-pressed="item.starred"
              :aria-label="item.starred ? 'Unstar' : 'Star'"
              @click="toggleStar(item.id)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L4.5 9.7l5.9-.8z" />
              </svg>
            </button>
            <button type="button" class="app-icon-btn" aria-label="Archive" @click="archive(item.id)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 4h18v4H3z" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" />
              </svg>
            </button>
            <button type="button" class="app-icon-btn" aria-label="Delete" @click="remove(item.id)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
              </svg>
            </button>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <!-- @app/ui: AppEmptyState -->
      <div v-else class="app-empty-state">
        <span class="app-empty-state__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
            stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l2-7h10l2 7v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" /><path d="M4 13h4l2 3h4l2-3h4" />
          </svg>
        </span>
        <h2 class="app-empty-state__title">{{ empty.title }}</h2>
        <p class="app-empty-state__text">{{ empty.text }}</p>
        <button v-if="empty.cta" type="button" class="app-empty-state__cta" @click="clearSearch">{{ empty.cta }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Tokens come from the global contract (tokens.preview.css). This component
 * defines none — it only consumes canonical vars. The single px literals are
 * 1px hairline borders / 3px focus-ring spreads (no border-width token exists). */

.app-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.app-library {
  min-height: 100dvh;
  padding: clamp(var(--space-5), 5vw, var(--space-14)) clamp(var(--space-4), 5vw, var(--space-6));
  background: var(--surface-page);
  color: var(--text-fg);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  &__inner {
    width: min(100%, 48rem);
    margin-inline: auto;
  }

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }

  &__title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tight);
  }

  &__count {
    color: var(--text-secondary);
    font-size: var(--text-md);
    white-space: nowrap;
  }
}

/* ---------------------------------------------------- AppFilterBar */
.app-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);

  &__seg {
    display: inline-flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--surface-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
  }

  &__seg-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-secondary);
    background: transparent;
    border: 0;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: color var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard);

    &:hover {
      color: var(--text-fg);
    }

    &[aria-pressed='true'] {
      color: var(--text-fg);
      background: var(--surface-raised);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

  &__seg-icon {
    color: var(--brand-accent);
  }

  &__count {
    font-size: var(--text-xs);
    font-weight: var(--fw-semibold);
    color: var(--text-tertiary);
  }

  &__spacer {
    flex: 1 1 var(--space-4);
  }
}

.app-select {
  position: relative;
  display: inline-flex;
  align-items: center;

  &__control {
    appearance: none;
    -webkit-appearance: none;
    padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--fw-medium);
    color: var(--text-fg);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    cursor: pointer;

    &:focus-visible {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

  &__caret {
    position: absolute;
    right: var(--space-2);
    color: var(--text-tertiary);
    pointer-events: none;
  }
}

.app-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 1 1 12rem;
  min-inline-size: 9rem;

  &__icon {
    position: absolute;
    left: var(--space-3);
    color: var(--text-tertiary);
    pointer-events: none;
  }

  &__control {
    width: 100%;
    padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
    font: inherit;
    font-size: var(--text-md);
    color: var(--text-fg);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    transition: border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);

    &::placeholder {
      color: var(--text-tertiary);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }
}

/* ------------------------------------------------------ AppItemCard */
.app-list {
  display: grid;
  gap: var(--space-3);
}

.app-item-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  transition: border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);

  &:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-md);
  }

  &--skeleton:hover {
    border-color: var(--border-default);
    box-shadow: none;
  }

  &__favicon {
    display: grid;
    place-items: center;
    width: var(--space-10);
    height: var(--space-10);
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: var(--text-lg);
    color: var(--brand-accent);
    background: var(--surface-surface);
    border-radius: var(--radius-lg);
  }

  &__body {
    display: grid;
    align-content: start;
    gap: var(--space-1);
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: var(--text-lg);
    line-height: var(--leading-snug);
    letter-spacing: var(--tracking-tight);
    color: var(--text-fg);
    text-wrap: pretty;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  &__sep {
    width: 3px;
    height: 3px;
    border-radius: var(--radius-pill);
    background: currentColor;
    opacity: 0.55;
  }

  &__fetching {
    display: grid;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  &__excerpt {
    margin: var(--space-1) 0 0;
    font-family: var(--font-reading);
    font-size: var(--text-md);
    line-height: var(--leading-normal);
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    &--failed {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--status-error-fg);
      -webkit-line-clamp: none;
    }
  }

  &__retry {
    padding: 0;
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--brand-accent);
    background: none;
    border: 0;
    text-decoration: underline;
    cursor: pointer;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  &__actions {
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    opacity: 0;
    transition: opacity var(--dur-base) var(--ease-standard);
  }

  &:hover &__actions,
  &:focus-within &__actions {
    opacity: 1;
  }
}

@media (hover: none) {
  .app-item-card__actions {
    opacity: 1;
  }
}

.app-icon-btn {
  display: grid;
  place-items: center;
  width: var(--space-8);
  height: var(--space-8);
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard);

  &:hover {
    color: var(--text-fg);
    background: var(--surface-surface);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
  }

  &--on {
    color: var(--brand-accent);

    svg {
      fill: color-mix(in oklab, var(--brand-accent) 22%, transparent);
    }
  }
}

/* ------------------------------------------------------ AppTagChip */
.app-tag-chip {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  color: var(--text-secondary);
  background: var(--surface-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
}

/* --------------------------------------------------- AppStatusBadge */
.app-status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
  border-radius: var(--radius-pill);

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-pill);
    background: currentColor;
  }

  &--pending {
    color: var(--status-info-fg);
    background: var(--status-info-subtle);
  }

  &--extracting {
    color: var(--status-warning-fg);
    background: var(--status-warning-subtle);
  }

  &--ready {
    color: var(--status-success-fg);
    background: var(--status-success-subtle);
  }

  &--failed {
    color: var(--status-error-fg);
    background: var(--status-error-subtle);
  }

  &--pending &__dot,
  &--extracting &__dot {
    animation: app-pulse 1.3s var(--ease-standard) infinite;
  }
}

/* ------------------------------------------------------ AppSkeleton */
.app-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--surface-surface) 8%,
    color-mix(in oklab, var(--surface-surface), var(--text-fg) 6%) 24%,
    var(--surface-surface) 40%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: app-shimmer 1.4s linear infinite;

  &--favicon {
    width: var(--space-10);
    height: var(--space-10);
    border-radius: var(--radius-lg);
  }

  &--title {
    width: 62%;
    height: var(--space-4);
    margin-bottom: var(--space-2);
  }

  &--meta {
    width: 40%;
    height: var(--space-3);
    margin-bottom: var(--space-3);
  }

  &--line {
    height: var(--space-3);
  }

  &--w90 {
    width: 90%;
  }

  &--w70 {
    width: 70%;
  }
}

/* ----------------------------------------------------- AppEmptyState */
.app-empty-state {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-6);
  text-align: center;

  &__icon {
    display: grid;
    place-items: center;
    width: var(--space-16);
    height: var(--space-16);
    color: var(--text-tertiary);
    background: var(--surface-surface);
    border-radius: var(--radius-pill);
  }

  &__title {
    margin: var(--space-1) 0 0;
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: var(--text-xl);
    color: var(--text-fg);
  }

  &__text {
    margin: 0;
    max-width: 36ch;
    font-size: var(--text-md);
    line-height: var(--leading-normal);
    color: var(--text-secondary);
  }

  &__cta {
    margin-top: var(--space-2);
    padding: var(--space-3) var(--space-4);
    font: inherit;
    font-weight: var(--fw-semibold);
    font-size: var(--text-md);
    color: var(--brand-accent-fg);
    background: var(--brand-accent);
    border: 0;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: background var(--dur-base) var(--ease-standard);

    &:hover {
      background: var(--brand-accent-hover);
    }

    &:active {
      background: var(--brand-accent-active);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }
}

@keyframes app-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes app-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .app-skeleton { animation-duration: 2.6s; }
  .app-status-badge__dot { animation: none; }
}
</style>
