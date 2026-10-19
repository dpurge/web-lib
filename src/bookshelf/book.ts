import * as v from 'valibot';

// Values equal the book's field names, so a link kind can index a Book directly.
export enum LinkKind {
  Book = 'book',
  Pdf = 'pdf',
  Audio = 'audio',
}

// An absent or empty link means the book has no such link.
const LinkSchema = v.optional(v.string());

export const BookSchema = v.object({
  title: v.string(),
  subtitle: v.string(),
  author: v.string(),
  year: v.string(),
  description: v.string(),
  cover: v.string(),
  [LinkKind.Book]: LinkSchema,
  [LinkKind.Pdf]: LinkSchema,
  [LinkKind.Audio]: LinkSchema,
});

export const ShelfSchema = v.object({
  title: v.string(),
  description: v.string(),
  books: v.array(BookSchema),
});

export const ShelvesSchema = v.array(ShelfSchema);

export type Book = v.InferOutput<typeof BookSchema>;
export type Shelf = v.InferOutput<typeof ShelfSchema>;
