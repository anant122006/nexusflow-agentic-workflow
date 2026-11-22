/**
 * @file n8nDispatcher.test.ts
 * @description Comprehensive unit tests for the enterprise n8n workflow synchronization engine.
 */

import { describe, it, expect } from 'vitest';
import { N8nWorkflowDispatcher } from '../server/engine/n8nDispatcher.js';
import { IncidentContext, DecisionBranch, ActionPayload } from '../server/types.js';

function makeContext(overrides: Partial<IncidentContext> = {}): IncidentContext {
  return {
    id: 'INC-3001',
    title: 'Database Outage Reported',
    rawInput: 'Cluster db-primary is non-responsive',
    customerTier: 'Enterprise (Platinum)',
    slaMinutes: 15,
    sentiment: 'Frustrated / Urgent',
    detectedIntent: 'Sev-1 Infrastructure Incident Response',
    systemImpact: 'Full Outage',
    ...overrides
  };
}

function makeDecision(): DecisionBranch {
  return {
    decisionId: 'DEC-SEV1',
    ruleName: 'Critical Outage Policy',
    conditionMet: 'systemImpact == Full Outage',
    chosenAction: 'Escalate to SRE war room and trigger rollback',
    requiresHumanApproval: true,
    confidenceScore: 98.5
  };
}

describe('N8nWorkflowDispatcher — Outbound Pipeline Trigger', () => {
  it('should dispatch incident context and return structured sync report', async () => {
    const ctx = makeContext();
    const decision = makeDecision();
    const actions: ActionPayload[] = [];

    const report = await N8nWorkflowDispatcher.dispatchToN8n(ctx, decision, actions);

    expect(report.workflowId).toBe('wf-nexusflow-incident-orchestrator');
    expect(report.status).toBe('DISPATCHED');
    expect(report.webhookUrl).toContain('nexusflow-incident');
    expect(report.connectedNodes.length).toBeGreaterThanOrEqual(4);
    expect(report.connectedNodes.some(n => n.includes('TinyFish'))).toBe(true);
    expect(report.dispatchedAt).toBeDefined();
  });

  it('should generate valid ActionPayload with N8N_WORKFLOW_TRIGGER type', async () => {
    const ctx = makeContext();
    const decision = makeDecision();
    const report = await N8nWorkflowDispatcher.dispatchToN8n(ctx, decision, []);
    const action = N8nWorkflowDispatcher.createActionPayload(report, ctx);

    expect(action.actionType).toBe('N8N_WORKFLOW_TRIGGER');
    expect(action.status).toBe('DISPATCHED');
    expect(action.targetDestination).toContain('n8n Workflow Hub');
    expect(action.summary).toContain('Enterprise (Platinum)');
    expect(action.details.workflowId).toBe(report.workflowId);
    expect(action.details.nodes).toEqual(report.connectedNodes);
  });
});
