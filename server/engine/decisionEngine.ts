import { IncidentContext, DecisionBranch } from '../types.js';

export class DecisionIntelligenceEngine {
  /**
   * Applies logical contextual reasoning to select execution branches and safety gates
   */
  public static evaluateDecision(context: IncidentContext): DecisionBranch {
    // Branch A: Sev-1 Critical Infrastructure Outage
    if (context.systemImpact === 'Full Outage') {
      return {
        decisionId: 'DEC-SEV1-FAILOVER',
        ruleName: 'Critical Outage Rapid Triage & Disaster Recovery',
        conditionMet: `systemImpact == 'Full Outage' AND slaMinutes <= 15 (Customer: ${context.customerTier})`,
        chosenAction: 'Escalate to Tier 3 SRE, notify #war-room on Slack, generate AWS rollback plan, and queue human verification gate.',
        requiresHumanApproval: true,
        confidenceScore: 98.4
      };
    }

    // Branch B: Performance Degradation
    if (context.systemImpact === 'Degraded Performance') {
      return {
        decisionId: 'DEC-PERF-AUTOSCALE',
        ruleName: 'Dynamic Telemetry & Horizontal Auto-Scaling',
        conditionMet: `systemImpact == 'Degraded Performance' (SLA: ${context.slaMinutes}m)`,
        chosenAction: 'Trigger Kubernetes horizontal pod autoscaling (+200% capacity), purge CDN cache, and post diagnostic telemetry.',
        requiresHumanApproval: false,
        confidenceScore: 94.7
      };
    }

    // Branch C: Financial / Billing Dispute
    if (context.systemImpact === 'Billing Dispute') {
      const isHighValue = context.customerTier === 'Enterprise (Platinum)';
      return {
        decisionId: 'DEC-FINANCE-REFUND',
        ruleName: 'High-Value Retention & Financial Adjustment Policy',
        conditionMet: `systemImpact == 'Billing Dispute' (Tier: ${context.customerTier})`,
        chosenAction: isHighValue
          ? 'Prepare $1,200 SLA credit voucher; route to VP of Customer Success for 1-click authorization.'
          : 'Issue automatic $50 courtesy account credit and send updated statement.',
        requiresHumanApproval: isHighValue,
        confidenceScore: 96.1
      };
    }

    // Branch D: Standard Inquiry / Self-Service Resolution
    return {
      decisionId: 'DEC-AUTO-RESOLVE',
      ruleName: 'Semantic Knowledge Synthesis & Direct Resolution',
      conditionMet: 'systemImpact == "General Query" AND sentiment == "Inquiry"',
      chosenAction: 'Retrieve verified technical documentation snippet, compose personalized response, and log resolved ticket in CRM.',
      requiresHumanApproval: false,
      confidenceScore: 99.1
    };
  }
}
