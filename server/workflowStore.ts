import { createRequire } from 'node:module';
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { WorkflowResult } from './types.js';

export class WorkflowStore {
  private db: InstanceType<typeof DatabaseSync>;

  constructor(file: string) {
    mkdirSync(dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, result TEXT NOT NULL, expires INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS expiration ON runs(expires)');
  }

  save(result: WorkflowResult) {
    const now = Date.now();
    this.db.prepare('DELETE FROM runs WHERE expires <= ?').run(now);
    this.db.prepare('INSERT INTO runs VALUES (?, ?, ?)').run(result.executionId, JSON.stringify(result), now + 86400000);
  }

  approve(id: string, transition: (run: WorkflowResult) => WorkflowResult) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = this.db.prepare('SELECT result FROM runs WHERE id = ? AND expires > ?').get(id, Date.now());
      let result: WorkflowResult | undefined;
      if (row) {
        result = JSON.parse(String(row.result)) as WorkflowResult;
        if (result.status === 'WAITING_HUMAN_APPROVAL') {
          result = transition(result);
          this.db.prepare('UPDATE runs SET result = ? WHERE id = ?').run(JSON.stringify(result), id);
        }
      }
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
