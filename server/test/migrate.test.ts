import { describe, it, expect } from 'vitest';
import { openDb } from '../src/db/connection';
import { runMigrations } from '../src/db/migrate';

describe('runMigrations', () => {
  it('is idempotent', () => {
    const db = openDb(':memory:');
    runMigrations(db);
    expect(runMigrations(db)).toEqual([]);
  });
});
