/**
 * @file toolDispatchers.test.ts
 * @description Unit tests for the EnterpriseToolDispatcher.
 * Validates that each systemImpact category dispatches the correct action types
 * and that HITL gate correctly flags high-risk operations.
 */

import { describe, it, expect } from 'vitest';
import { EnterpriseToolDispatcher } from '../server/engine/toolDispatchers.js';
import { IncidentContext, DecisionBranch } from '../server/types.js';

/** Shared helper: creates a minimal valid IncidentContext */
function makeContext(overrides: Partial<IncidentContext> = {}): IncidentContext {
  return {
    id: 'INC-1001',
    title: 'Test Incident',
    rawInput: 'Test raw input',
    customerTier: 'Enterprise (Platinum)',
    slaMinutes: 15,
    sentiment: 'Neutral',
    detectedIntent: 'General Support Assistance',
    systemImpact: 'General Query',
    ...overrides
  };
}

/** Shared helper: creates a minimal valid DecisionBranch */
function makeDecision(requiresHumanApproval = false): DecisionBranch {
  return {
    decisionId: 'DEC-TEST',
    ruleName: 'Test Rule',
    conditionMet: 'systemImpact == test',
    chosenAction: 'Test action',
    requiresHumanApproval,
    confidenceScore: 95.0
  };
}

describe('EnterpriseToolDispatcher — Full Outage Actions', () => {
  it('should dispatch 4 actions for Full Outage scenario', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(true));
    expect(actions.length).toBe(4);
  });

  it('should include JIRA_ESCALATION action for Full Outage', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(true));
    const jira = actions.find((a) => a.actionType === 'JIRA_ESCALATION');
    expect(jira).toBeDefined();
    expect(jira?.details?.priority).toBe('Highest');
  });

  it('should include SLACK_ONCALL action for Full Outage', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    const slack = actions.find((a) => a.actionType === 'SLACK_ONCALL');
    expect(slack).toBeDefined();
    expect(slack?.details?.urgency).toBe('Immediate');
  });

  it('should set AWS_ROLLBACK status to HELD_FOR_APPROVAL when HITL required', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(true));
    const rollback = actions.find((a) => a.actionType === 'AWS_ROLLBACK');
    expect(rollback?.status).toBe('HELD_FOR_APPROVAL');
  });

  it('should set AWS_ROLLBACK status to DISPATCHED when no HITL required', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(false));
    const rollback = actions.find((a) => a.actionType === 'AWS_ROLLBACK');
    expect(rollback?.status).toBe('DISPATCHED');
  });

  it('should include CUSTOMER_EMAIL action for Full Outage', () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    const email = actions.find((a) => a.actionType === 'CUSTOMER_EMAIL');
    expect(email).toBeDefined();
    expect(email?.details?.template).toBe('IncidentNotification-Sev1');
  });
});

describe('EnterpriseToolDispatcher — Degraded Performance Actions', () => {
  it('should dispatch 2 actions for Degraded Performance scenario', () => {
    const ctx = makeContext({ systemImpact: 'Degraded Performance' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    expect(actions.length).toBe(2);
  });

  it('should include JIRA_ESCALATION with High priority for Degraded Performance', () => {
    const ctx = makeContext({ systemImpact: 'Degraded Performance' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    const jira = actions.find((a) => a.actionType === 'JIRA_ESCALATION');
    expect(jira?.details?.priority).toBe('High');
    expect(jira?.details?.replicaTarget).toBe(12);
  });

  it('should include CUSTOMER_EMAIL for Degraded Performance', () => {
    const ctx = makeContext({ systemImpact: 'Degraded Performance' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    const email = actions.find((a) => a.actionType === 'CUSTOMER_EMAIL');
    expect(email).toBeDefined();
  });
});

describe('EnterpriseToolDispatcher — Billing Dispute Actions', () => {
  it('should dispatch 2 actions for Billing Dispute scenario', () => {
    const ctx = makeContext({ systemImpact: 'Billing Dispute' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(true));
    expect(actions.length).toBe(2);
  });

  it('should include REFUND_DISPATCH action for Billing Dispute', () => {
    const ctx = makeContext({ systemImpact: 'Billing Dispute' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    const refund = actions.find((a) => a.actionType === 'REFUND_DISPATCH');
    expect(refund).toBeDefined();
    expect(refund?.details?.currency).toBe('USD');
    expect(refund?.details?.amount).toBe(1200);
  });

  it('should set REFUND_DISPATCH to HELD_FOR_APPROVAL when HITL required', () => {
    const ctx = makeContext({ systemImpact: 'Billing Dispute' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(true));
    const refund = actions.find((a) => a.actionType === 'REFUND_DISPATCH');
    expect(refund?.status).toBe('HELD_FOR_APPROVAL');
  });

  it('should auto-dispatch REFUND when no HITL required', () => {
    const ctx = makeContext({ systemImpact: 'Billing Dispute' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision(false));
    const refund = actions.find((a) => a.actionType === 'REFUND_DISPATCH');
    expect(refund?.status).toBe('DISPATCHED');
  });
});

describe('EnterpriseToolDispatcher — General Query Actions', () => {
  it('should dispatch 1 action for General Query scenario', () => {
    const ctx = makeContext({ systemImpact: 'General Query' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    expect(actions.length).toBe(1);
  });

  it('should send CUSTOMER_EMAIL with RESOLVED status for General Query', () => {
    const ctx = makeContext({ systemImpact: 'General Query' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    expect(actions[0].actionType).toBe('CUSTOMER_EMAIL');
    expect(actions[0].status).toBe('RESOLVED');
  });

  it('should include knowledge base articles for General Query', () => {
    const ctx = makeContext({ systemImpact: 'General Query' });
    const actions = EnterpriseToolDispatcher.dispatchActions(ctx, makeDecision());
    expect(actions[0].details?.knowledgeBaseArticles).toContain('KB-9041');
  });
});
