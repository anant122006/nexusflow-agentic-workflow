import { it, expect } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WorkflowStore } from '../server/workflowStore.js';
import { AgenticWorkflowOrchestrator } from '../server/engine/agentOrchestrator.js';

it('reloads held actions and applies approval once across connections', async () => {
  const engine = new AgenticWorkflowOrchestrator();
  const run = await engine.executeWorkflow('Enterprise outage', 'Checkout API down for Platinum customers');
  expect(run.status).toBe('WAITING_HUMAN_APPROVAL');
  const db = join(mkdtempSync(join(tmpdir(), 'nx-store-')), 'runs.sqlite');
  new WorkflowStore(db).save(run);
  const reopened = new WorkflowStore(db);
  const approved = reopened.approve(run.executionId, value => engine.approveAction(value));
  expect(approved?.status).toBe('COMPLETED');
  expect(reopened.approve(run.executionId, () => { throw Error('duplicate transition'); })).toEqual(approved);
  expect(reopened.approve('unknown', value => value)).toBeUndefined();
});
