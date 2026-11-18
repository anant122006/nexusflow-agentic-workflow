import { WorkflowNode, IncidentContext, DecisionBranch } from '../types.js';

export class WorkflowDAGEngine {
  /**
   * Constructs dynamic DAG nodes tailored to the specific incident and decision branch
   */
  public static buildWorkflowDAG(context: IncidentContext, decision: DecisionBranch): WorkflowNode[] {
    const isCritical = context.systemImpact === 'Full Outage';

    const nodes: WorkflowNode[] = [
      {
        id: 'node-guardrail',
        label: 'Security Guardrail & Input Sanitizer',
        agentRole: 'Prompt Shield & Threat Sentinel',
        status: 'completed',
        outputSummary: 'Input vetted: 0 injection attempts, PII sanitized.',
        dependencies: []
      },
      {
        id: 'node-context',
        label: 'Context Extraction & SLA Classifier',
        agentRole: 'Context & Memory Intelligence',
        status: 'completed',
        outputSummary: `Identified ${context.customerTier} account. SLA: ${context.slaMinutes}m.`,
        dependencies: ['node-guardrail']
      },
      {
        id: 'node-decision',
        label: 'Policy & Logic Decision Router',
        agentRole: 'Strategic Policy Orchestrator',
        status: 'completed',
        outputSummary: `Rule triggered: ${decision.ruleName} (Confidence: ${decision.confidenceScore}%)`,
        dependencies: ['node-context']
      }
    ];

    if (isCritical) {
      nodes.push(
        {
          id: 'node-jira',
          label: 'Jira Sev-1 Incident Escalator',
          agentRole: 'Issue Tracker Integrator',
          status: 'completed',
          outputSummary: 'Dispatched Sev-1 incident ticket on SRE board.',
          dependencies: ['node-decision']
        },
        {
          id: 'node-slack',
          label: 'Slack On-Call War-Room Dispatcher',
          agentRole: 'Realtime Incident Comm Agent',
          status: 'completed',
          outputSummary: 'Paged on-call incident commander in #incident-war-room.',
          dependencies: ['node-decision']
        },
        {
          id: 'node-rollback',
          label: 'AWS Cluster Rollback Verification',
          agentRole: 'Cloud Infrastructure Automator',
          status: decision.requiresHumanApproval ? 'waiting_approval' : 'completed',
          outputSummary: decision.requiresHumanApproval
            ? 'Production rollback prepared. Awaiting human administrator approval.'
            : 'Canary isolated. Traffic redirected to stable baseline.',
          dependencies: ['node-decision']
        },
        {
          id: 'node-email',
          label: 'Customer SLA Notification & Outreach',
          agentRole: 'Customer Engagement Agent',
          status: 'completed',
          outputSummary: 'Dispatched automated status bulletin to account admin.',
          dependencies: ['node-jira', 'node-slack']
        }
      );
    } else {
      nodes.push(
        {
          id: 'node-exec',
          label: 'Automated Action Dispatcher',
          agentRole: 'Operations Dispatcher',
          status: decision.requiresHumanApproval ? 'waiting_approval' : 'completed',
          outputSummary: decision.chosenAction,
          dependencies: ['node-decision']
        },
        {
          id: 'node-comm',
          label: 'Customer Outreach & Resolution Log',
          agentRole: 'Support Synthesizer',
          status: 'completed',
          outputSummary: 'Generated customer communication and closed SLA window.',
          dependencies: ['node-exec']
        }
      );
    }

    return nodes;
  }
}
