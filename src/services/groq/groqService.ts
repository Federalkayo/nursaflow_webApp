import { ChatMessage } from '../../types';
import { supabase } from '../supabase/supabaseClient';

export interface GroqResponse {
  answer: string;
  suggestedFollowUps: string[];
  isFallback?: boolean;
  fallbackReason?: string;
}

// Backwards compatibility interface alias
export type GeminiResponse = GroqResponse;

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

export const groqService = {
  getModel(): string {
    return import.meta.env.VITE_GROQ_MODEL || DEFAULT_MODEL;
  },

  /**
   * Pings the Supabase Edge Function to verify server-side connection and secret status
   */
  async testApiKey(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('groq-tutor', {
        body: { ping: true },
      });

      if (!error && data?.status === 'ok') {
        return {
          success: true,
          message: data.message || 'Supabase Edge Function connected securely with GROQ_API_KEY secret.',
          model: this.getModel(),
        };
      }

      const detail = error?.message || data?.error || 'Failed to ping edge function';
      return { success: false, message: `Edge Function Status: ${detail}` };
    } catch (err: any) {
      return { success: false, message: `Network Error: ${err.message || 'Failed to reach Supabase Edge Function'}` };
    }
  },

  /**
   * Main entrypoint for AI Nursing Tutor.
   * All requests are routed EXCLUSIVELY through Supabase Edge Function 'groq-tutor'.
   * Zero API keys are stored, read, or transmitted client-side.
   */
  async askNursingTutor(userQuestion: string, conversationHistory: ChatMessage[] = []): Promise<GroqResponse> {
    let lastDiagnosticError = '';

    try {
      const { data, error } = await supabase.functions.invoke('groq-tutor', {
        body: {
          userQuestion,
          conversationHistory,
          model: this.getModel(),
        },
      });

      if (!error && data?.answer) {
        const parsed = parseGroqOutput(data.answer);
        return { ...parsed, isFallback: false };
      }

      if (error) {
        lastDiagnosticError = error.message || 'Edge Function execution error';
        console.warn('[Groq Edge Function Notice]:', lastDiagnosticError);
      } else if (data?.error) {
        lastDiagnosticError = data.error;
        console.warn('[Groq Edge Function Error Payload]:', lastDiagnosticError);
      }
    } catch (edgeErr: any) {
      lastDiagnosticError = edgeErr.message || 'Network exception calling Edge Function';
      console.warn('[Groq Edge Function Exception]:', lastDiagnosticError);
    }

    // Fallback Response with explicit UX warning notice if Edge Function is unreachable or not deployed
    await new Promise((resolve) => setTimeout(resolve, 800));
    const fallbackResponse = generateIntelligentNursingResponse(userQuestion);
    return {
      ...fallbackResponse,
      isFallback: true,
      fallbackReason: lastDiagnosticError || 'Supabase Edge Function Proxy Unreachable',
    };
  },

  async generateFlashcards(topic: string, count: number = 5): Promise<Array<{ question: string; answer: string }>> {
    try {
      const prompt = `Generate ${count} NCLEX-RN style flashcards on "${topic}". Return strictly a JSON array: [{"question": "...", "answer": "..."}]`;
      const { data, error } = await supabase.functions.invoke('groq-tutor', {
        body: {
          userQuestion: prompt,
          model: this.getModel(),
        },
      });

      if (!error && data?.answer) {
        const text = data.answer;
        const match = text.match(/\[\s*\{.*\}\s*\]/s);
        if (match) {
          return JSON.parse(match[0]);
        }
      }
    } catch (e) {
      console.warn('[Groq Edge Function] Flashcard fallback:', e);
    }

    return [
      {
        question: `Topic: ${topic} - Priority Nursing Intervention`,
        answer: `Assess airway, breathing, and circulation (ABCs) first, followed by focused organ assessment and vital signs monitoring.`,
      },
      {
        question: `Topic: ${topic} - High-Yield NCLEX Concept`,
        answer: `Verify dosage calculations with a second licensed nurse for high-alert medications (e.g., insulin, heparin, concentrated electrolytes).`,
      },
    ];
  },
};

// Export geminiService alias for backwards compatibility
export const geminiService = groqService;

/**
 * Intelligent NCLEX Nursing Education Engine
 * Generates tailored, structured clinical explanations for any nursing query when live API key is unavailable or restricted.
 */
function generateIntelligentNursingResponse(userQuestion: string): GroqResponse {
  const q = userQuestion.toLowerCase().trim();

  // Greetings
  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'hi!' || q === 'hello!') {
    return {
      answer: `Hello! 👋 How can I assist your nursing studies or NCLEX preparation today?

Feel free to ask me about:
* **Pharmacology & Drug Cards** (e.g., Digoxin, Insulin protocols, ACE inhibitors)
* **Pathophysiology & Disease Management** (e.g., DKA, Heart Failure, Sepsis protocols)
* **NCLEX Prioritization & Delegation** (e.g., ABCs, Maslow's Hierarchy, ADPIE)
* **Dosage & IV Calculation Questions**`,
      suggestedFollowUps: [
        'Explain the difference between systolic and diastolic blood pressure.',
        'Quiz me on pharmacology cardiac glycosides.',
        'What is the fluid & insulin protocol for DKA management?'
      ]
    };
  }

  if (q.includes('pharm') || q.includes('digoxin') || q.includes('medication') || q.includes('drug')) {
    return {
      answer: `### High-Yield Pharmacology: Cardiac Glycosides & Safe Medication Administration

**Key Drug**: Digoxin (Lanoxin)

**Mechanism of Action**:
Digoxin inhibits the Na+/K+ ATPase pump, increasing intracellular calcium in cardiac myocytes. This produces:
* **Positive Inotropic effect**: Increases force of myocardial contraction.
* **Negative Chronotropic effect**: Decreases heart rate and AV node conduction velocity.

**Priority Nursing Assessments (NCLEX Essentials)**:
1. **Apical Pulse Rate**: Measure apical pulse for **1 full minute** prior to administration. Hold medication if HR < 60 bpm in adults (or < 90 bpm in infants).
2. **Electrolyte Monitoring**: Monitor Serum Potassium (3.5 – 5.0 mEq/L). **Hypokalemia drastically increases digoxin toxicity risk** because digoxin binds to the Na+/K+ pump at the potassium site.
3. **Serum Digoxin Level**: Therapeutic range is **0.5 – 2.0 ng/mL**.

**Signs of Digoxin Toxicity**:
* Early: Anorexia, nausea, vomiting, abdominal pain.
* Neurological: Confusion, weakness, headache.
* Visual: **Yellow-green halos**, blurry vision, or photophobia.
* Cardiac: Bradycardia, PVCs, or AV block. Antidote: **Digoxin Immune Fab (Digibind)**.`,
      suggestedFollowUps: [
        'What is the difference between ACE Inhibitors and Beta Blockers?',
        'How do I calculate IV drip rates for high-alert meds?',
        'Quiz me on pharmacology NCLEX questions'
      ]
    };
  }

  if (q.includes('dka') || q.includes('diabet') || q.includes('insulin') || q.includes('ketoacidosis')) {
    return {
      answer: `### Clinical Protocol: Diabetic Ketoacidosis (DKA) Management

**Pathophysiology**:
Absolute insulin deficiency in Type 1 Diabetes leads to cellular starvation, severe hyperglycemia, lipolysis, ketone body formation, and severe metabolic acidosis.

**Diagnostic Triad**:
1. **Hyperglycemia**: Blood Glucose > 250 mg/dL.
2. **Metabolic Acidosis**: Arterial pH < 7.30, Serum Bicarbonate < 18 mEq/L.
3. **Ketosis**: Positive urine and serum ketones, fruity (acetone) breath.

**Priority Nursing Interventions (Fluid & Insulin Protocol)**:
1. **Fluid Resuscitation (First Priority)**: Start **0.9% Normal Saline (NS)** at 1 to 1.5 L/hr during the first hour to restore intravascular volume and renal perfusion.
2. **Potassium Check**: Verify Serum Potassium is **> 3.3 mEq/L** BEFORE initiating IV insulin infusion to prevent life-threatening hypokalemic arrhythmias.
3. **Regular IV Insulin**: Administer IV Regular Insulin continuous infusion (0.1 units/kg/hr).
4. **Dextrose Addition**: When blood glucose reaches ~250 mg/dL, add **5% Dextrose (D5W)** to IV fluids to prevent hypoglycemia and rapid osmotic shifts leading to cerebral edema.`,
      suggestedFollowUps: [
        'How does DKA differ from Hyperosmolar Hyperglycemic State (HHS)?',
        'What are Kussmaul respirations and why do they occur?',
        'Give me a fluid resuscitation dosage calculation question'
      ]
    };
  }

  if (q.includes('blood pressure') || q.includes('hypertension') || q.includes('systolic') || q.includes('diastolic')) {
    return {
      answer: `### Cardiovascular Physiology: Systolic vs. Diastolic Blood Pressure

**Systolic Blood Pressure (Top Number)**:
* Represents the peak pressure exerted against arterial walls during ventricular contraction (systole).
* Normal Target: **< 120 mmHg**.

**Diastolic Blood Pressure (Bottom Number)**:
* Represents the residual resting pressure in the arterial system when the ventricles relax and refill with blood (diastole).
* Normal Target: **< 80 mmHg**.

**Clinical Calculations & NCLEX High-Yields**:
* **Pulse Pressure**: Pulse Pressure = Systolic - Diastolic. A widening pulse pressure (>40 mmHg) can indicate increased intracranial pressure (Cushing's Triad) or aortic regurgitation.
* **Mean Arterial Pressure (MAP)**: MAP = (Systolic + 2 * Diastolic) / 3. A MAP of at least **65 mmHg** is necessary to maintain adequate tissue perfusion to vital organs (brain, kidneys).`,
      suggestedFollowUps: [
        'How do I calculate Mean Arterial Pressure (MAP)?',
        'What are the first-line antihypertensive medications?',
        'Quiz me on adult health cardiovascular questions'
      ]
    };
  }

  // Universal NCLEX AI Nursing response generator
  const cleanTitle = userQuestion.length > 35 ? `${userQuestion.slice(0, 35)}...` : userQuestion;

  return {
    answer: `### NCLEX Nursing Review: ${cleanTitle}

**Core Nursing Concept**:
When addressing **${userQuestion}**, always apply the core nursing framework: **Prioritization (ABCs: Airway, Breathing, Circulation)**, **Maslow's Hierarchy of Needs**, and the **Nursing Process (ADPIE - Assessment, Diagnosis, Planning, Implementation, Evaluation)**.

**Priority Nursing Steps**:
1. **Assessment First**: Always gather objective vital signs and subjective symptoms before taking invasive actions (unless emergency resuscitation is needed).
2. **Client Safety**: Identify fall risks, infection control protocols, and safety precautions.
3. **Interventions**: Implement evidence-based nursing care plan protocols and communicate critical changes using SBAR (Situation, Background, Assessment, Recommendation).
4. **Client Education**: Ensure the patient understands discharge instructions, red-flag symptoms, and medication compliance.`,
    suggestedFollowUps: [
      `Give me an NCLEX practice question about ${cleanTitle}`,
      'Explain priority nursing interventions',
      'Give me a pharmacology review on this topic'
    ]
  };
}

/**
 * Helper to separate answer text from JSON suggestedFollowUps
 */
function parseGroqOutput(rawText: string): GroqResponse {
  let answer = rawText;
  let suggestedFollowUps: string[] = [];

  const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```$/;
  const match = rawText.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1]);
      if (Array.isArray(parsedJson.suggestedFollowUps)) {
        suggestedFollowUps = parsedJson.suggestedFollowUps.map(String);
      }
      answer = rawText.replace(jsonBlockRegex, '').trim();
    } catch (e) {
      // Ignore JSON parse error
    }
  }

  if (suggestedFollowUps.length === 0) {
    suggestedFollowUps = [
      'Explain the pathophysiology in more detail',
      'Give me an NCLEX question on this topic',
      'What are priority nursing interventions?'
    ];
  }

  return { answer, suggestedFollowUps };
}
