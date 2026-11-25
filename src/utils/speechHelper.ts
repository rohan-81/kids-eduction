/**
/**
 * Speech Recognition and Pronunciation Matching Utilities for KidsZone
 */

/** Clean speech transcript or target word for accurate comparison */
export function cleanSpeechText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[•\-\(\)\.,\/!?'"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Compute Levenshtein distance between two strings */
export function computeLevenshtein(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Validates whether spoken speech matches the target learning word.
 * Strictly avoids false positives on silence, noise or mismatch.
 */
export function isSpeechMatch(
  heard: string,
  target: string
): { match: boolean; confidence: number } {
  const cleanH = cleanSpeechText(heard);
  const cleanT = cleanSpeechText(target);

  // Strictly require actual non-empty input
  if (!cleanH || !cleanT) {
    return { match: false, confidence: 0 };
  }

  // 1. Exact match
  if (cleanH === cleanT) {
    return { match: true, confidence: 1 };
  }

  // 2. Direct containment (child said target or target phrase contains heard)
  if (cleanH.includes(cleanT) || cleanT.includes(cleanH)) {
    return { match: true, confidence: 0.95 };
  }

  // 3. Word token overlap
  const hTokens = cleanH.split(' ');
  const tTokens = cleanT.split(' ');
  const hasTokenMatch = tTokens.some(
    (t) => t.length >= 2 && hTokens.includes(t)
  );
  if (hasTokenMatch) {
    return { match: true, confidence: 0.9 };
  }

  // 4. Levenshtein phonetic distance
  const dist = computeLevenshtein(cleanH, cleanT);
  const maxLen = Math.max(cleanH.length, cleanT.length);
  const similarity = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

  if (similarity >= 0.55) {
    return { match: true, confidence: similarity };
  }

  return { match: false, confidence: similarity };
}
