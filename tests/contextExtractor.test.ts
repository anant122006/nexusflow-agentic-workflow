/**
 * @file contextExtractor.test.ts
 * @description Comprehensive unit tests for the ContextExtractorAgent.
 * Validates all 4 systemImpact categories, all 3 customer tiers, and all 3 sentiment modes.
 */

import { describe, it, expect } from 'vitest';
import { ContextExtractorAgent } from '../server/engine/contextExtractor.js';

describe('ContextExtractorAgent — Customer Tier Detection', () => {
  it('should detect Enterprise (Platinum) tier from "enterprise" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Enterprise API Failure',
      'Our enterprise platinum account cannot process payments.'
    );
    expect(ctx.customerTier).toBe('Enterprise (Platinum)');
    expect(ctx.slaMinutes).toBe(15);
  });

  it('should detect Enterprise (Platinum) tier from "vip" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'VIP Account Outage',
      'The VIP customer is reporting a full service outage.'
    );
    expect(ctx.customerTier).toBe('Enterprise (Platinum)');
  });

  it('should detect Business (Gold) tier from "production" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Production Issue',
      'Production database is unreachable for our business account.'
    );
    expect(ctx.customerTier).toBe('Business (Gold)');
    expect(ctx.slaMinutes).toBe(60);
  });

  it('should detect Business (Gold) tier from "pro plan" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Pro Plan Query',
      'Our pro plan environment is experiencing slowness.'
    );
    expect(ctx.customerTier).toBe('Business (Gold)');
  });

  it('should default to Standard (Silver) tier for generic keywords', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'General Inquiry',
      'How do I reset my password?'
    );
    expect(ctx.customerTier).toBe('Standard (Silver)');
    expect(ctx.slaMinutes).toBe(240);
  });
});

describe('ContextExtractorAgent — System Impact Classification', () => {
  it('should classify Full Outage from "outage" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Site Down',
      'Complete outage reported across all regions.'
    );
    expect(ctx.systemImpact).toBe('Full Outage');
    expect(ctx.slaMinutes).toBeLessThanOrEqual(15);
  });

  it('should classify Full Outage from "critical" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Critical Failure',
      'Critical system failure — all services are down.'
    );
    expect(ctx.systemImpact).toBe('Full Outage');
  });

  it('should classify Degraded Performance from "latency" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Slow API',
      'The API response latency has increased to 8000ms.'
    );
    expect(ctx.systemImpact).toBe('Degraded Performance');
  });

  it('should classify Degraded Performance from "intermittent" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Intermittent Errors',
      'Users are seeing intermittent 503 errors.'
    );
    expect(ctx.systemImpact).toBe('Degraded Performance');
  });

  it('should classify Billing Dispute from "refund" keyword without outage context', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Refund Request',
      'Please process a refund for my latest invoice.'
    );
    expect(ctx.systemImpact).toBe('Billing Dispute');
  });

  it('should classify Billing Dispute from "invoice" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Invoice Discrepancy',
      'There is an error in our billing invoice this month.'
    );
    expect(ctx.systemImpact).toBe('Billing Dispute');
  });

  it('should NOT misclassify billing when "crash" is also present (outage wins)', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Mixed Scenario',
      'System crash causing billing to stop working, full outage reported.'
    );
    // outage/crash terms override billing
    expect(ctx.systemImpact).toBe('Full Outage');
  });

  it('should default to General Query for unclassified inputs', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Password Reset',
      'How do I reset my two-factor authentication?'
    );
    expect(ctx.systemImpact).toBe('General Query');
  });
});

describe('ContextExtractorAgent — Sentiment Detection', () => {
  it('should detect Frustrated / Urgent from "asap" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Urgent Request',
      'Fix this ASAP — it is completely unacceptable.'
    );
    expect(ctx.sentiment).toBe('Frustrated / Urgent');
  });

  it('should detect Frustrated / Urgent from "immediately" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Immediate Fix Needed',
      'This needs to be resolved immediately or we will escalate to legal.'
    );
    expect(ctx.sentiment).toBe('Frustrated / Urgent');
  });

  it('should detect Inquiry sentiment from "how to" keyword', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Documentation Question',
      'How to configure webhook endpoints according to the guide?'
    );
    expect(ctx.sentiment).toBe('Inquiry');
  });

  it('should default to Neutral sentiment for calm inputs', () => {
    const ctx = ContextExtractorAgent.extractContext(
      'Feature Request',
      'We would like to request a new feature for our dashboard.'
    );
    expect(ctx.sentiment).toBe('Neutral');
  });
});

describe('ContextExtractorAgent — Intent & ID Generation', () => {
  it('should map Full Outage to Sev-1 intent', () => {
    const ctx = ContextExtractorAgent.extractContext('Outage', 'System outage now');
    expect(ctx.detectedIntent).toContain('Sev-1');
  });

  it('should map Billing Dispute to Financial Adjustment intent', () => {
    const ctx = ContextExtractorAgent.extractContext('Billing', 'billing charge refund');
    expect(ctx.detectedIntent).toContain('Financial');
  });

  it('should generate unique INC- prefixed IDs', () => {
    const ctx1 = ContextExtractorAgent.extractContext('Test', 'test input');
    const ctx2 = ContextExtractorAgent.extractContext('Test', 'test input');
    expect(ctx1.id).toMatch(/^INC-\d{4}$/);
    expect(ctx2.id).toMatch(/^INC-\d{4}$/);
  });
});
