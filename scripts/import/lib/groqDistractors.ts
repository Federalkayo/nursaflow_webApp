// Generates plausible wrong-answer options for datasets that only provide
// a question + correct answer (e.g. MedNurse-QA), so they can be rendered
// as MCQs by the existing QuizzesPage UI.
//
// IMPORTANT: rows produced with these options are always marked
// ai_generated_options = true and status = 'review'. They must never be
// bulk-published without a human (ideally an RN) checking that the
// distractors are clearly wrong and not themselves misleading —
// this is the "avoid inventing medical facts" / "do not present unverified
// generated questions as medically authoritative" rule from the brief.

import Groq from 'groq-sdk';

let client: Groq | null = null;
function getClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is required to generate distractors.');
    client = new Groq({ apiKey });
  }
  return client;
}

// Deliberately independent of VITE_GROQ_MODEL in case the tutor's model
// ever changes, but defaults to the SAME model already confirmed working
// on this account (openai/gpt-oss-120b, used by the groq-tutor edge
// function) rather than guessing an unverified model name. Override with
// GROQ_DISTRACTOR_MODEL if you have access to something cheaper/faster —
// verify first with:
//   curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
const MODEL = process.env.GROQ_DISTRACTOR_MODEL || process.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';

export interface DistractorResult {
  options: string[]; // includes the correct answer, shuffled
}

/**
 * Asks Groq for 3 wrong-but-plausible options for a nursing question whose
 * correct answer is already known and fixed (never invented by the model).
 * Returns null if generation fails or the response doesn't validate —
 * callers should skip the row rather than guess.
 */
export async function generateDistractors(
  question: string,
  correctAnswer: string
): Promise<DistractorResult | null> {
  const prompt = `You are helping build a nursing exam question bank. You are given a
question and its ALREADY-CORRECT answer. Do not change or re-derive the
correct answer. Your only job is to write exactly 3 short, plausible-but-
WRONG distractor options a nursing student might mistakenly pick.

Rules:
- Distractors must be clearly, factually wrong to someone who knows the
  material — never a second correct answer, never a rephrasing of the
  correct answer, never true-but-irrelevant.
- Keep each option under 15 words, similar length/style to the correct answer.
- Do not include the correct answer text in any distractor.
- Respond with a JSON object of the exact shape {"distractors": ["...", "...", "..."]}
  containing exactly 3 strings. No other text, no markdown fences.

Question: ${question}
Correct answer: ${correctAnswer}`;

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await getClient().chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const choice = completion.choices[0];
      const raw = choice?.message?.content?.trim() || '';

      if (!raw) {
        console.warn(`[distractor skip] empty content (finish_reason: ${choice?.finish_reason})`);
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.warn(`[distractor skip] invalid JSON: "${raw.slice(0, 150)}"`);
        return null;
      }

      const distractors = (parsed as { distractors?: unknown })?.distractors;
      if (!Array.isArray(distractors) || distractors.length !== 3) {
        console.warn(`[distractor skip] expected {distractors: [3 items]}, got: ${raw.slice(0, 150)}`);
        return null;
      }
      if (!distractors.every((d) => typeof d === 'string' && d.trim().length > 0)) {
        console.warn('[distractor skip] one or more items were empty/non-string');
        return null;
      }

      const normalizedCorrect = correctAnswer.trim().toLowerCase();
      const cleaned = distractors.map((d: string) => d.trim());
      if (cleaned.some((d) => d.toLowerCase() === normalizedCorrect)) {
        console.warn('[distractor skip] model echoed the correct answer as a distractor');
        return null;
      }
      if (new Set(cleaned.map((d) => d.toLowerCase())).size !== 3) {
        console.warn('[distractor skip] duplicate distractors in model response');
        return null;
      }

      const options = [correctAnswer.trim(), ...cleaned];
      // Shuffle so the correct answer isn't always option A.
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return { options };
    } catch (err) {
      const message = (err as Error).message || '';
      const isRateLimit = message.includes('429') || message.toLowerCase().includes('rate limit');
      if (isRateLimit && attempt < MAX_ATTEMPTS) {
        const backoffMs = 2000 * attempt;
        console.warn(`[distractor retry] rate limited, waiting ${backoffMs}ms (attempt ${attempt}/${MAX_ATTEMPTS})`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      console.warn('[distractor generation failed]', message);
      return null;
    }
  }
  return null;
}
