import { describe, it, expect } from 'vitest';
import { WorkflowDAGEngine } from '../server/engine/workflowDAG.js';
import { ContextExtractorAgent } from '../server/engine/contextExtractor.js';
import { DecisionIntelligenceEngine } from '../server/engine/decisionEngine.js';

describe('WorkflowDAGEngine (Parameter: Efficiency & Dynamic Routing)', () => {
  it('should construct branching DAG nodes with correct dependencies for Sev-1', () => {
    const context = ContextExtractorAgent.extractContext(
      'Critical System Outage',
      'Production cluster is down and returning 500s'
    );
    const decision = DecisionIntelligenceEngine.evaluateDecision(context);
    const nodes = WorkflowDAGEngine.buildWorkflowDAG(context, decision);

    expect(nodes.length).toBeGreaterThanOrEqual(6);
    expect(nodes.some(n => n.id === 'node-guardrail')).toBe(true);
    expect(nodes.some(n => n.id === 'node-rollback')).toBe(true);
    expect(nodes.some(n => n.id === 'node-slack')).toBe(true);
  });
});
