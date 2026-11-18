import { SecurityAnalysis, RiskLevel } from '../types.js';

export class SecurityGuardrailEngine {
  private static readonly INJECTION_PATTERNS = [
    { pattern: /(?:ignore previous instructions|disregard all previous|override system prompt)/i, name: 'Direct System Prompt Override' },
    { pattern: /(?:you are now DAN|do anything now|jailbreak mode)/i, name: 'Adversarial Jailbreak Persona' },
    { pattern: /(?:show me your (?:system|hidden|internal) prompt|reveal instructions)/i, name: 'System Prompt Exfiltration' },
    { pattern: /(?:SELECT\s+\*\s+FROM|DROP\s+TABLE|--\s*$|UNION\s+SELECT)/i, name: 'SQL Injection in Request Body' },
    { pattern: /(?:<script>|javascript:|onerror=)/i, name: 'Cross-Site Scripting (XSS) Attack' },
    { pattern: /(?:rm\s+-rf|curl\s+http|nc\s+-e|\/etc\/passwd)/i, name: 'Remote Code Execution / Shell Command' }
  ];

  /**
   * Sanitizes user inputs and evaluates prompt injection threats before workflow ingestion
   */
  public static inspectInput(rawText: string): SecurityAnalysis {
    const threatsDetected: string[] = [];
    let threatLevel: RiskLevel = 'LOW';
    let sanitized = rawText;

    // Check injection patterns
    for (const rule of this.INJECTION_PATTERNS) {
      if (rule.pattern.test(rawText)) {
        threatsDetected.push(rule.name);
        threatLevel = 'CRITICAL';
      }
    }

    // Mask sensitive tokens, credit cards, or internal API keys
    sanitized = sanitized
      .replace(/(?:sk-[a-zA-Z0-9]{24,})/g, '[REDACTED_API_KEY]')
      .replace(/(?:\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b)/g, '[REDACTED_CREDIT_CARD]')
      .replace(/(?:AIzaSy[a-zA-Z0-9_\-]{33})/g, '[REDACTED_GOOGLE_KEY]');

    const isSafe = threatsDetected.length === 0;
    const guardrailScore = isSafe ? 100 : Math.max(10, 100 - threatsDetected.length * 40);

    return {
      isSafe,
      threatLevel,
      threatsDetected,
      sanitizedInput: sanitized,
      guardrailScore
    };
  }
}
