import { ActionPayload, IncidentContext, DecisionBranch } from '../types.js';

export class EnterpriseToolDispatcher {
  /**
   * Synthesizes and dispatches domain tool actions according to the decision branch
   */
  public static dispatchActions(context: IncidentContext, decision: DecisionBranch): ActionPayload[] {
    const actions: ActionPayload[] = [];

    if (context.systemImpact === 'Full Outage') {
      actions.push({
        actionType: 'JIRA_ESCALATION',
        targetDestination: 'Jira Service Management [SEV1-BOARD]',
        summary: `[CRITICAL OUTAGE] ${context.title} — SLA: ${context.slaMinutes}m`,
        details: {
          issueKey: `SEV1-${Math.floor(100 + Math.random() * 900)}`,
          priority: 'Highest',
          assignee: 'On-Call Incident Commander',
          customerTier: context.customerTier
        },
        status: 'DISPATCHED'
      });

      actions.push({
        actionType: 'SLACK_ONCALL',
        targetDestination: 'Slack #incident-war-room',
        summary: `🚨 *SEV-1 ALERT:* Outage reported by ${context.customerTier} account. Triage agent active.`,
        details: {
          channel: '#incident-war-room',
          urgency: 'Immediate',
          pagerDutyAlertSent: true
        },
        status: 'DISPATCHED'
      });

      actions.push({
        actionType: 'AWS_ROLLBACK',
        targetDestination: 'AWS ECS / Kubernetes Production Cluster',
        summary: 'Rollback canary release v2.4.1 $\\rightarrow$ stable v2.4.0',
        details: {
          cluster: 'prod-us-east-1',
          imageTag: 'sha-e47b2c0',
          reversionPlanVerified: true
        },
        status: decision.requiresHumanApproval ? 'HELD_FOR_APPROVAL' : 'DISPATCHED'
      });

      actions.push({
        actionType: 'CUSTOMER_EMAIL',
        targetDestination: `primary-contact@${context.customerTier.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        summary: `Status Update: Our SRE team is actively mitigating your incident [${context.id}]`,
        details: {
          template: 'IncidentNotification-Sev1',
          estimatedResolutionMinutes: context.slaMinutes
        },
        status: 'DISPATCHED'
      });
    } else if (context.systemImpact === 'Degraded Performance') {
      actions.push({
        actionType: 'JIRA_ESCALATION',
        targetDestination: 'Jira Core SRE Queue',
        summary: `[DEGRADATION] Elevated latency reported: ${context.title}`,
        details: {
          priority: 'High',
          autoScaleCluster: 'k8s-ingress-fleet',
          replicaTarget: 12
        },
        status: 'DISPATCHED'
      });

      actions.push({
        actionType: 'CUSTOMER_EMAIL',
        targetDestination: 'customer-admin@domain.com',
        summary: `Diagnostic Telemetry & Auto-Scaling Active for Ticket ${context.id}`,
        details: {
          actionTaken: 'Edge cache purged; pod autoscaling triggered (+200%).'
        },
        status: 'DISPATCHED'
      });
    } else if (context.systemImpact === 'Billing Dispute') {
      actions.push({
        actionType: 'REFUND_DISPATCH',
        targetDestination: 'Stripe Corporate Billing Gateway',
        summary: 'Process courtesy SLA credit voucher ($1,200.00)',
        details: {
          reason: 'SLA Breach Compensation',
          currency: 'USD',
          amount: 1200
        },
        status: decision.requiresHumanApproval ? 'HELD_FOR_APPROVAL' : 'DISPATCHED'
      });

      actions.push({
        actionType: 'CUSTOMER_EMAIL',
        targetDestination: 'finance@enterprise.com',
        summary: `Resolution for Invoice Inquiry #${context.id}`,
        details: {
          compensationCreditPending: decision.requiresHumanApproval
        },
        status: 'DISPATCHED'
      });
    } else {
      actions.push({
        actionType: 'CUSTOMER_EMAIL',
        targetDestination: 'user@client.com',
        summary: `Resolution to your inquiry: ${context.title}`,
        details: {
          knowledgeBaseArticles: ['KB-9041', 'API-Quickstart-v2'],
          autoClosed: true
        },
        status: 'RESOLVED'
      });
    }

    return actions;
  }
}
