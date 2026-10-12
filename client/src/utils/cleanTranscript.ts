export type TranscriptFixRule = readonly [RegExp, string];

export const TRANSCRIPT_FIX_RULES: readonly TranscriptFixRule[] = [
  // "acme lab(s) inc/ink" -> "Acme Labs Inc"
  [/\bacme\s+labs?\s+(?:inc|ink)\b/gi, 'Acme Labs Inc'],
  // "acme core/cord" -> "Acme Corp"
  [/\bacme\s+(?:core|cord|corp)\b/gi, 'Acme Corp'],
  // "nexus flow" -> "NexusFlow"
  [/\bnexus\s*flow\b/gi, 'NexusFlow'],
  // "saarthi ai" / "saarthi" -> "SaarthAI"
  [/\bsaar?thi(?:\s*ai)?\b/gi, 'SaarthAI'],
];

/**
 * Pure function applying rule-based transcript fixes for domain-specific terminology.
 */
export function cleanTranscript(text: string): string {
  if (!text) return '';
  let cleaned = text;
  for (const [pattern, replacement] of TRANSCRIPT_FIX_RULES) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}
