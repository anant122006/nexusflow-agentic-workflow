export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval' | 'skipped';

export interface WorkflowNode {
  id: string;
  label: string;
  agentRole: string;
  status: NodeStatus;
  startedAt?: string;
  completedAt?: string;
  outputSummary?: string;
  dependencies: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentContext {
  id: string;
  title: string;
  rawInput: string;
  customerTier: 'Enterprise (Platinum)' | 'Business (Gold)' | 'Standard (Silver)';
  slaMinutes: number;
  sentiment: 'Frustrated / Urgent' | 'Neutral' | 'Inquiry';
  detectedIntent: string;
  systemImpact: 'Full Outage' | 'Degraded Performance' | 'Billing Dispute' | 'General Query';
}

export interface SecurityAnalysis {
  isSafe: boolean;
  threatLevel: RiskLevel;
  threatsDetected: string[];
  sanitizedInput: string;
  guardrailScore: number; // 0 - 100
}

export interface DecisionBranch {
  decisionId: string;
  ruleName: string;
  conditionMet: string;
  chosenAction: string;
  requiresHumanApproval: boolean;
  confidenceScore: number;
}

export interface ActionPayload {
  actionType: 'JIRA_ESCALATION' | 'SLACK_ONCALL' | 'AWS_ROLLBACK' | 'CUSTOMER_EMAIL' | 'REFUND_DISPATCH';
  targetDestination: string;
  summary: string;
  details: Record<string, any>;
  status: 'DISPATCHED' | 'HELD_FOR_APPROVAL' | 'RESOLVED';
}

export interface WorkflowResult {
  executionId: string;
  incidentId: string;
  status: 'COMPLETED' | 'WAITING_HUMAN_APPROVAL' | 'BLOCKED_BY_SECURITY';
  context: IncidentContext;
  security: SecurityAnalysis;
  decision: DecisionBranch;
  nodes: WorkflowNode[];
  actionsDispatched: ActionPayload[];
  executionTimeMs: number;
  tokenSavingsPercentage: number;
  logs: Array<{
    timestamp: string;
    agent: string;
    level: 'info' | 'warn' | 'success' | 'alert';
    message: string;
  }>;
}
