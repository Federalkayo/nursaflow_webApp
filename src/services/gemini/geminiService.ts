import { ChatMessage } from '../../types';

/**
 * GEMINI AI TUTOR SERVICE PLACEHOLDER
 * ===================================
 * TODO: Replace this mock implementation with Gemini AI API integration:
 * 1. Import `@google/genai` or call a secure backend proxy endpoint.
 * 2. Configure model: `gemini-2.5-flash` or `gemini-2.5-pro` with system instruction:
 *    "You are NursaFlow AI, an expert, empathetic, NCLEX-level nursing education tutor."
 * 3. IMPORTANT: NEVER expose raw GEMINI_API_KEY in client-side production code.
 *    Use Firebase Cloud Functions or an API gateway.
 */

export interface GeminiResponse {
  answer: string;
  suggestedFollowUps: string[];
}

const MOCK_AI_RESPONSES: Record<string, GeminiResponse> = {
  default: {
    answer: `### Systolic vs Diastolic Blood Pressure Explained

**Systolic Blood Pressure (Top Number)**:
* Represents the pressure exerted on arterial walls when the heart's ventricles contract and pump blood into circulation.
* Normal target: < 120 mmHg.

**Diastolic Blood Pressure (Bottom Number)**:
* Represents the residual pressure in arterial walls when the ventricles relax and fill with blood between beats.
* Normal target: < 80 mmHg.

**Key Clinical Tip**:
A widening pulse pressure (Systolic - Diastolic) can be an early indicator of increased intracranial pressure (Cushing's Triad) or aortic regurgitation.`,
    suggestedFollowUps: [
      'Quiz me on cardiovascular medications',
      'What are the risk factors for Stage 2 Hypertension?',
      'How does kidney disease affect blood pressure regulation?'
    ]
  },
  pharmacology: {
    answer: `### High-Yield Pharmacology Review: Cardiac Glycosides (Digoxin)

**Mechanism of Action**:
Digoxin inhibits the Na+/K+ ATPase pump, increasing intracellular calcium in cardiac muscle. This results in **positive inotropic action** (increased force of contraction) and **negative chronotropic action** (decreased heart rate).

**Nursing Assessment**:
1. Check **apical heart rate** for 1 full minute before administration. Hold if HR < 60 bpm.
2. Monitor **Serum Potassium levels (3.5 - 5.0 mEq/L)**. Hypokalemia drastically increases digoxin toxicity risk!
3. Monitor **Digoxin Therapeutic Levels (0.5 - 2.0 ng/mL)**.

**Toxicity Signs**:
Nausea/vomiting, anorexia, bradycardia, and **yellow/green halo visual disturbances** (Classic NCLEX question!).`,
    suggestedFollowUps: [
      'What is the antidote for Digoxin toxicity?',
      'Explain the difference between ACE Inhibitors and Beta Blockers',
      'Give me a dosage calculation question for Digoxin'
    ]
  },
  dka: {
    answer: `### Diabetic Ketoacidosis (DKA) Clinical Management

**Pathophysiology**:
Absolute insulin deficiency leads to hyperglycemia, hyperosmolality, lipolysis, ketone production, and severe metabolic acidosis.

**Classic Triad & Symptoms**:
1. Hyperglycemia (>250 mg/dL)
2. Ketosis (positive serum/urine ketones, fruity breath)
3. Acidosis (pH < 7.30, HCO3 < 18 mEq/L, Kussmaul respirations)

**Priority Nursing Interventions (Fluid & Insulin Protocol)**:
1. **IV Fluid Reconstitution**: Start 0.9% Normal Saline immediately (1-1.5 L in first hour).
2. **Regular Insulin IV Infusion**: 0.1 units/kg/hr.
3. **Potassium Replacement**: Verify K+ > 3.3 mEq/L before starting insulin to avoid fatal arrhythmia.
4. **Dextrose Addition**: When blood glucose drops to ~250 mg/dL, add D5W to IV fluids to prevent cerebral edema!`,
    suggestedFollowUps: [
      'How does DKA differ from HHS (Hyperosmolar Hyperglycemic State)?',
      'What is Kussmaul breathing?',
      'Quiz me on endocrine NCLEX questions'
    ]
  }
};

export const geminiService = {
  /**
   * Abstracted interface to ask the AI Nursing Tutor a question
   */
  async askNursingTutor(userQuestion: string, conversationHistory: ChatMessage[] = []): Promise<GeminiResponse> {
    console.log(`[Gemini AI TODO] Sending prompt to Gemini AI API: "${userQuestion}"`);
    console.log(`[Gemini AI TODO] Context includes ${conversationHistory.length} previous messages.`);
    
    // Simulate network delay of Gemini response
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const lowerQ = userQuestion.toLowerCase();
    if (lowerQ.includes('pharm') || lowerQ.includes('digoxin') || lowerQ.includes('drug') || lowerQ.includes('medication')) {
      return MOCK_AI_RESPONSES.pharmacology;
    }
    if (lowerQ.includes('dka') || lowerQ.includes('diabet') || lowerQ.includes('insulin') || lowerQ.includes('sugar')) {
      return MOCK_AI_RESPONSES.dka;
    }

    return MOCK_AI_RESPONSES.default;
  },

  /**
   * TODO: Generate dynamic flashcards using Gemini API
   */
  async generateFlashcards(topic: string, count: number = 5): Promise<Array<{ question: string; answer: string }>> {
    console.log(`[Gemini AI TODO] Requesting ${count} generated flashcards for topic: ${topic}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return [
      {
        question: `AI Generated: What is the primary adverse effect of Angiotensin-Converting Enzyme (ACE) Inhibitors?`,
        answer: `Persistent dry cough caused by the accumulation of bradykinin in the lungs.`
      },
      {
        question: `AI Generated: What is the classic triad of symptoms in Meningitis?`,
        answer: `Fever, nuchal rigidity (stiff neck), and altered mental status (plus Kernig's/Brudzinski's signs).`
      }
    ];
  }
};
