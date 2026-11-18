import { IncidentContext } from '../types.js';

export class ContextExtractorAgent {
  /**
   * Deep context extraction based on user input, domain patterns, and metadata
   */
  public static extractContext(title: string, input: string): IncidentContext {
    const combined = `${title} ${input}`.toLowerCase();

    // 1. Detect Customer Tier & SLA
    let customerTier: IncidentContext['customerTier'] = 'Standard (Silver)';
    let slaMinutes = 240;

    if (/enterprise|platinum|fortune|tier 1|vip/i.test(combined)) {
      customerTier = 'Enterprise (Platinum)';
      slaMinutes = 15;
    } else if (/business|gold|pro plan|production/i.test(combined)) {
      customerTier = 'Business (Gold)';
      slaMinutes = 60;
    }

    // 2. Detect System Impact (Check specific categories with word boundaries)
    let systemImpact: IncidentContext['systemImpact'] = 'General Query';
    
    // Check billing first if explicit refund/charge/billing query
    if (/\b(?:refund|charge|invoice|billing|overage|credit card)\b/i.test(combined) && !/\b(?:500|crash|outage)\b/i.test(combined)) {
      systemImpact = 'Billing Dispute';
    } else if (/\b(?:outage|crash|blackout|critical)\b|500 internal|\bdown\b/i.test(combined)) {
      systemImpact = 'Full Outage';
      slaMinutes = Math.min(slaMinutes, 15);
    } else if (/\b(?:slow|latency|degraded|timeout|intermittent)\b/i.test(combined)) {
      systemImpact = 'Degraded Performance';
      slaMinutes = Math.min(slaMinutes, 45);
    } else if (/\b(?:refund|charge|invoice|billing|credit card)\b/i.test(combined)) {
      systemImpact = 'Billing Dispute';
    }

    // 3. Detect Sentiment
    let sentiment: IncidentContext['sentiment'] = 'Neutral';
    if (/\b(?:urgent|asap|furious|lawyer|unacceptable|immediately|broken)\b/i.test(combined)) {
      sentiment = 'Frustrated / Urgent';
    } else if (/\b(?:how to|question|inquiry|docs|guide)\b/i.test(combined)) {
      sentiment = 'Inquiry';
    }

    // 4. Intent Classification
    let detectedIntent = 'General Support Assistance';
    if (systemImpact === 'Full Outage') {
      detectedIntent = 'Sev-1 Infrastructure Incident Response & Automated Rollback';
    } else if (systemImpact === 'Degraded Performance') {
      detectedIntent = 'Performance Telemetry Profiling & Auto-Scaling Trigger';
    } else if (systemImpact === 'Billing Dispute') {
      detectedIntent = 'Customer Financial Adjustment & Retention Workflow';
    }

    return {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      rawInput: input,
      customerTier,
      slaMinutes,
      sentiment,
      detectedIntent,
      systemImpact
    };
  }
}
