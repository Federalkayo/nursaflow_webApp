// Free alternative to Groq-generated distractors: builds wrong-answer
// options by sampling OTHER real answers from the same dataset, grouped by
// chapter/topic-hint, rather than asking an AI model to invent them.
//
// Trade-off vs AI generation: these distractors are always real, true
// statements (about a different question), so nothing is fabricated —
// but they may occasionally be too obviously off-topic, or in rare cases
// still arguably correct out of context. This is why rows built this way
// still land at status = 'review' like everything else; a human check
// before publishing is not optional either way.

export interface AnswerPool {
  /** answers grouped by a coarse key (e.g. chapter), deduped, case-insensitive */
  byGroup: Map<string, string[]>;
  /** flat fallback pool used when a group doesn't have enough unique answers */
  all: string[];
}

export function buildAnswerPool(records: { groupKey: string; answer: string }[]): AnswerPool {
  const byGroup = new Map<string, Set<string>>();
  const allSet = new Set<string>();

  for (const { groupKey, answer } of records) {
    const trimmed = answer.trim();
    if (!trimmed) continue;
    allSet.add(trimmed);
    if (!byGroup.has(groupKey)) byGroup.set(groupKey, new Set());
    byGroup.get(groupKey)!.add(trimmed);
  }

  const byGroupArrays = new Map<string, string[]>();
  for (const [key, set] of byGroup) byGroupArrays.set(key, Array.from(set));

  return { byGroup: byGroupArrays, all: Array.from(allSet) };
}

const MIN_POOL_SIZE = 8; // need enough unique answers in-group to sample 3 distinct, varied ones

/**
 * Picks 3 distinct wrong-answer options for `correctAnswer`, preferring
 * same-group (same chapter) answers for topical plausibility, falling back
 * to the global pool if the group is too small. Returns null if there
 * simply aren't enough distinct answers anywhere to sample from (very rare).
 */
export function sampleDistractors(
  pool: AnswerPool,
  groupKey: string,
  correctAnswer: string
): string[] | null {
  const correctNormalized = correctAnswer.trim().toLowerCase();
  const groupPool = (pool.byGroup.get(groupKey) || []).filter(
    (a) => a.toLowerCase() !== correctNormalized
  );

  const sourcePool = groupPool.length >= MIN_POOL_SIZE
    ? groupPool
    : pool.all.filter((a) => a.toLowerCase() !== correctNormalized);

  if (sourcePool.length < 3) return null;

  // Reservoir-style random distinct pick of 3.
  const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
  const picked: string[] = [];
  const seen = new Set<string>();
  for (const candidate of shuffled) {
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(candidate);
    if (picked.length === 3) break;
  }

  return picked.length === 3 ? picked : null;
}

export function shuffleWithCorrect(correctAnswer: string, distractors: string[]): string[] {
  const options = [correctAnswer, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
