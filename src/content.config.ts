import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/**
 * Symbol category catalogue.
 *
 * Backed by a single JSON file so the whole catalogue stays diffable in one
 * place. The Zod schema below is the contract: if a category is missing a
 * required field or has the wrong shape, `astro build` fails locally instead
 * of shipping a broken page.
 */
const categories = defineCollection({
  loader: file('src/data/categories.json', {
    parser: (text) => {
      const parsed = JSON.parse(text) as { categories: Array<{ slug: string }> };
      // The file loader keys entries by `id`; our records are keyed by `slug`.
      return parsed.categories.map((category) => ({ ...category, id: category.slug }));
    },
  }),
  schema: z.object({
    // --- identity / SEO ---
    slug: z.string(),
    emoji: z.string(),
    displayName: z.string(),
    h1: z.string(),
    title: z.string(),
    description: z.string(),
    unicodeBlock: z.string().optional(),

    // --- copy ---
    directAnswer: z.string().optional(),
    intro: z.string(),
    howToUse: z.string(),

    // --- symbols: either a flat list, or a flat list plus named groups ---
    symbols: z.array(z.string()),
    groups: z
      .array(
        z.object({
          name: z.string(),
          symbols: z.array(z.string()),
        })
      )
      .optional(),

    // --- optional: filterable combination library ---
    comboTitle: z.string().optional(),
    comboIntro: z.string().optional(),
    comboGroups: z
      .array(
        z.object({
          name: z.string(),
          items: z.array(z.string()),
        })
      )
      .optional(),

    // --- optional: ready-made copy sets ---
    copySetsTitle: z.string().optional(),
    copySetsIntro: z.string().optional(),
    copySets: z
      .array(
        z.object({
          label: z.string(),
          text: z.string(),
          description: z.string(),
        })
      )
      .optional(),

    // --- optional: username pattern generator, {name} is the placeholder ---
    namePatterns: z.array(z.string()).optional(),

    // --- optional: reference table ---
    referenceTitle: z.string().optional(),
    referenceRows: z
      .array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          code: z.string().optional(),
          use: z.string(),
        })
      )
      .optional(),

    // --- shared page furniture ---
    useCases: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
    related: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        emoji: z.string(),
      })
    ),
  }),
});

export const collections = { categories };
