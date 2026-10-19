import * as v from 'valibot';
import { type Shelf, ShelvesSchema } from './book';

// Throws an Error whose message says what failed and where.
export async function loadShelves(url: string): Promise<Shelf[]> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    // fetch rejects with a bare "Failed to fetch" that does not say which file
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load ${url}: ${reason}`);
  }
  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status} ${response.statusText}`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(`${url} is not valid JSON`);
  }

  const result = v.safeParse(ShelvesSchema, json);
  if (!result.success) {
    throw new Error(`${url} does not have the expected shape:\n${v.summarize(result.issues)}`);
  }
  return result.output;
}
