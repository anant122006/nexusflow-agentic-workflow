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
  guardrailScore: number;
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
  actionType: 'JIRA_ESCALATION' | 'SLACK_ONCALL' | 'AWS_ROLLBACK' | 'CUSTOMER_EMAIL' | 'REFUND_DISPATCH' | 'TINYFISH_WEB_INSPECTION' | 'N8N_WORKFLOW_TRIGGER';
  targetDestination: string;
  summary: string;
  details: Record<string, any>;
  status: 'DISPATCHED' | 'HELD_FOR_APPROVAL' | 'RESOLVED';
}

export interface TinyFishReport {
  sessionId: string;
  targetUrl: string;
  goal: string;
  status: 'OUTAGE_VERIFIED' | 'DEGRADED_PERFORMANCE' | 'HEALTHY' | 'ANALYSIS_COMPLETE';
  domFinding: string;
  httpStatus: number;
  latencyMs: number;
  screenshotCaptured: boolean;
  browserStepsExecuted: string[];
}

export interface N8nSyncReport {
  workflowId: string;
  webhookUrl: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED';
  connectedNodes: string[];
  dispatchedAt: string;
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
  tinyfishReport?: TinyFishReport;
  n8nSyncReport?: N8nSyncReport;
  /** Legacy demo field. New runs omit token estimates. */
  tokenSavingsPercentage?: number;
  logs: Array<{
    timestamp: string;
    agent: string;
    level: 'info' | 'warn' | 'success' | 'alert';
    message: string;
  }>;
}

export interface ScenarioItem {
  id: string;
  category: string;
  title: string;
  description: string;
  expectedRouting: string;
}
