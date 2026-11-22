import { describe, it, expect } from 'vitest';
import { DecisionIntelligenceEngine } from '../server/engine/decisionEngine.js';
import { ContextExtractorAgent } from '../server/engine/contextExtractor.js';

describe('DecisionIntelligenceEngine (Parameter: Logical Decision Making)', () => {
  it('should route Sev-1 Full Outages to SRE war-room and require human approval', () => {
    const context = ContextExtractorAgent.extractContext(
      'Full Outage',
      'The payment gateway is completely down for Enterprise Platinum tier customers'
    );
    const decision = DecisionIntelligenceEngine.evaluateDecision(context);

    expect(decision.decisionId).toBe('DEC-SEV1-FAILOVER');
    expect(decision.requiresHumanApproval).toBe(true);
    expect(decision.confidenceScore).toBeGreaterThan(95);
  });

  it('should autonomously route performance degradation to auto-scaling without human hold', () => {
    const context = ContextExtractorAgent.extractContext(
      'Degraded API',
      'Intermittent latency spikes observed on ingress service'
    );
    const decision = DecisionIntelligenceEngine.evaluateDecision(context);

    expect(decision.decisionId).toBe('DEC-PERF-AUTOSCALE');
    expect(decision.requiresHumanApproval).toBe(false);
  });

  it('should require approval for Platinum billing disputes', () => {
    const context = ContextExtractorAgent.extractContext(
      'Billing Issue',
      'Enterprise Platinum customer requesting refund for SLA downtime'
    );
    const decision = DecisionIntelligenceEngine.evaluateDecision(context);

    expect(decision.decisionId).toBe('DEC-FINANCE-REFUND');
    expect(decision.requiresHumanApproval).toBe(true);
  });
});
