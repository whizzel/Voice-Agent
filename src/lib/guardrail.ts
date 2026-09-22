// ponytail: regex heuristics, not a moderation model. Upgrade to a hosted
// guardrail model (e.g. LlamaGuard) if false negatives show up in practice.
const JAILBREAK_PATTERNS = [
  /ignore (all|any|previous|prior|the) .*instructions/i,
  /disregard (your|the) (rules|guidelines|instructions)/i,
  /you are now/i,
  /reveal (your|the) system prompt/i,
]

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b(?:\d[ -]*?){13,16}\b/, // credit card
]

export type GuardrailResult = { allowed: boolean; reason?: string }

export function checkGuardrail(query: string): GuardrailResult {
  if (JAILBREAK_PATTERNS.some((p) => p.test(query))) {
    return { allowed: false, reason: "jailbreak_pattern" }
  }
  if (PII_PATTERNS.some((p) => p.test(query))) {
    return { allowed: false, reason: "pii_detected" }
  }
  return { allowed: true }
}
