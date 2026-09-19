import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";
import { POST_METADATA } from "./consts";

// zod 4 (Astro 7) no longer parses `.default()` values through the schema, so a
// defaulted reference would stay a plain string instead of becoming an
// { collection, id } stub. Route defaults through the reference transform with
// preprocess so both frontmatter-provided and defaulted values resolve to stubs.
const referenceList = <C extends "blog" | "tags" | "authors">(
  collection: C,
  defaults: string[]
) => z.preprocess((v) => v ?? defaults, z.array(reference(collection)));

const authors = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    shortBio: z.string(),
    company: z.string().optional(),
    email: z.string().email(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    layout: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: image().optional(),
      date: z.coerce.date(),
      tags: referenceList("tags", ["default"]),
      lastmod: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      summary: z.string(),
      images: z.string().optional(),
      authors: referenceList("authors", ["default"]),
      postLayout: z
        .enum(["simple", "column"])
        .default(POST_METADATA.defaultLayout as "simple" | "column"),
      canonicalUrl: z.string().optional(),
      related: referenceList("blog", []),
    }),
});

const tags = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tags" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const collections = { blog, authors, tags };
