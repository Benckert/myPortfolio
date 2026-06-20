function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[n];
}

export function suggestCommand(input: string, names: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  const lowerInput = input.toLowerCase();
  for (const name of names) {
    const d = levenshtein(lowerInput, name.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  // only suggest if reasonably close (<= ~third of the word)
  const threshold = Math.max(2, Math.floor(input.length / 2));
  return best !== null && bestDist <= threshold ? best : null;
}
