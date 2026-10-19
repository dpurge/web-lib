import './test-support';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as v from 'valibot';
import { BookSchema, LinkKind, ShelvesSchema } from './book';
import { makeBook } from './test-support';

test('the committed sample data matches the schema', () => {
  const data = JSON.parse(readFileSync('web/data/bookshelf.json', 'utf8'));
  assert.equal(v.safeParse(ShelvesSchema, data).success, true);
});

test('link fields are optional and may be empty', () => {
  assert.equal(v.safeParse(BookSchema, makeBook()).success, true);
  assert.equal(v.safeParse(BookSchema, makeBook({ pdf: '', audio: '' })).success, true);
});

test('a numeric year is rejected', () => {
  const result = v.safeParse(BookSchema, { ...makeBook(), year: 1999 });
  assert.equal(result.success, false);
});

test('a missing title is rejected', () => {
  const { title, ...withoutTitle } = makeBook();
  assert.equal(v.safeParse(BookSchema, withoutTitle).success, false);
});

test('link kinds are named after the book fields', () => {
  assert.deepEqual(Object.values(LinkKind), ['book', 'pdf', 'audio']);
});
