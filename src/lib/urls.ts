import type { CollectionEntry } from 'astro:content';

// Legacy Squarespace posts carry their original dated path; CMS-created
// entries fall back to a flat /section/id URL.
export function entryUrl(
  entry: CollectionEntry<'blog'> | CollectionEntry<'quotes'>,
  section: 'new-blog' | 'quotes'
): string {
  return entry.data.originalPath ?? `/${section}/${entry.id}`;
}
