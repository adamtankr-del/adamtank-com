import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entry = z.object({
  title: z.string(),
  date: z.coerce.date(),
  originalPath: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/blog' }),
  schema: entry,
});

const quotes = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/quotes' }),
  schema: entry,
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    path: z.string(),
  }),
});

export const collections = { blog, quotes, pages };
