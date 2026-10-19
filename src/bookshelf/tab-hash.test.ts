import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashFromIndex, indexFromHash } from './tab-hash';

test('a position in range selects that shelf', () => {
  assert.equal(indexFromHash('#1', 8), 0);
  assert.equal(indexFromHash('#3', 8), 2);
  assert.equal(indexFromHash('#8', 8), 7);
});

test('an empty hash selects the first shelf', () => {
  assert.equal(indexFromHash('', 8), 0);
  assert.equal(indexFromHash('#', 8), 0);
});

test('an out-of-range position selects the first shelf', () => {
  assert.equal(indexFromHash('#0', 8), 0);
  assert.equal(indexFromHash('#9', 8), 0);
  assert.equal(indexFromHash('#99999999999999999999', 8), 0);
});

test('anything that is not a plain positive number selects the first shelf', () => {
  for (const hash of ['#abc', '#3x', '#x3', '#-2', '#1.5', '#03', '#+2', '# 2', '3']) {
    assert.equal(indexFromHash(hash, 8), 0, hash);
  }
});

test('no shelves gives index 0', () => {
  assert.equal(indexFromHash('#1', 0), 0);
});

test('hashFromIndex is the inverse of indexFromHash', () => {
  for (let index = 0; index < 8; index += 1) {
    assert.equal(indexFromHash(hashFromIndex(index), 8), index);
  }
  assert.equal(hashFromIndex(2), '#3');
});
