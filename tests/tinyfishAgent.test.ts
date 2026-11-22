/**
 * @file tinyfishAgent.test.ts
 * @description Comprehensive unit tests for the TinyFish AI Web Agent integration.
 */

import { describe, it, expect } from 'vitest';
import { TinyFishAgent } from '../server/engine/tinyfishAgent.js';
import { IncidentContext } from '../server/types.js';

function makeContext(overrides: Partial<IncidentContext> = {}): IncidentContext {
  return {
    id: 'INC-2001',
    title: 'Checkout Endpoint Failing',
    rawInput: 'European checkout at https://payments.partner.com/checkout returning errors',
    customerTier: 'Enterprise (Platinum)',
    slaMinutes: 15,
    sentiment: 'Frustrated / Urgent',
    detectedIntent: 'Sev-1 Infrastructure Incident Response',
    systemImpact: 'Full Outage',
    ...overrides
  };
}

describe('TinyFishAgent — Target URL Extraction', () => {
  it('should extract explicit target URL from raw input', () => {
    const ctx = makeContext({
      rawInput: 'Users reporting that https://api.store.com/cart is throwing 500 errors'
    });
    const url = TinyFishAgent.extractTargetUrl(ctx);
    expect(url).toBe('https://api.store.com/cart');
  });

  it('should fallback to default checkout URL on Full Outage when no URL provided', () => {
    const ctx = makeContext({
      rawInput: 'Complete outage across all server nodes'
    });
    const url = TinyFishAgent.extractTargetUrl(ctx);
    expect(url).toContain('checkout.enterprise-cloud.net');
  });

  it('should fallback to auth endpoint on Degraded Performance', () => {
    const ctx = makeContext({
      systemImpact: 'Degraded Performance',
      rawInput: 'Elevated latency on login'
    });
    const url = TinyFishAgent.extractTargetUrl(ctx);
    expect(url).toContain('auth.enterprise-cloud.net');
  });

  it('should fallback to billing portal on Billing Dispute', () => {
    const ctx = makeContext({
      systemImpact: 'Billing Dispute',
      rawInput: 'Invoice overage discrepancy'
    });
    const url = TinyFishAgent.extractTargetUrl(ctx);
    expect(url).toContain('billing.stripe.com');
  });
});

describe('TinyFishAgent — Autonomous Web Investigation', () => {
  it('should perform investigation and return structured report for Full Outage', async () => {
    const ctx = makeContext({ systemImpact: 'Full Outage' });
    const report = await TinyFishAgent.investigateWebTarget(ctx);

    expect(report.sessionId).toMatch(/^tf-session-/);
    expect(report.status).toBe('OUTAGE_VERIFIED');
    expect(report.httpStatus).toBe(502);
    expect(report.latencyMs).toBeGreaterThan(0);
    expect(report.screenshotCaptured).toBe(true);
    expect(report.domFinding).toContain('502 Bad Gateway');
    expect(report.browserStepsExecuted.length).toBeGreaterThanOrEqual(5);
  });

  it('should return DEGRADED_PERFORMANCE status for performance incidents', async () => {
    const ctx = makeContext({
      systemImpact: 'Degraded Performance',
      rawInput: 'High TTFB latency observed'
    });
    const report = await TinyFishAgent.investigateWebTarget(ctx);

    expect(report.status).toBe('DEGRADED_PERFORMANCE');
    expect(report.httpStatus).toBe(200);
    expect(report.latencyMs).toBeGreaterThan(1000);
    expect(report.domFinding).toContain('TTFB');
  });

  it('should generate valid ActionPayload with TINYFISH_WEB_INSPECTION type', async () => {
    const ctx = makeContext();
    const report = await TinyFishAgent.investigateWebTarget(ctx);
    const action = TinyFishAgent.createActionPayload(report);

    expect(action.actionType).toBe('TINYFISH_WEB_INSPECTION');
    expect(action.status).toBe('DISPATCHED');
    expect(action.targetDestination).toContain('TinyFish');
    expect(action.details.sessionId).toBe(report.sessionId);
    expect(action.details.httpStatus).toBe(report.httpStatus);
  });
});
