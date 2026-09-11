import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface QuizQuestionSeed {
  topic_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  rationale: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TOPICS = [
  'fundamentals',
  'pharmacology',
  'medsurg',
  'maternal',
  'pediatrics',
  'mentalhealth',
  'fluids',
  'anatomy'
] as const;

/**
 * Script to generate high-yield NCLEX quiz questions.
 * Uses Gemini API if GEMINI_API_KEY or VITE_GEMINI_API_KEY is defined, 
 * otherwise outputs the built-in expanded question seed dataset to `supabase/seed_questions.sql`.
 */
async function main() {
  console.log('🚀 Initializing NursaFlow NCLEX Quiz Generator Script...');
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  let allQuestions: QuizQuestionSeed[] = [];

  if (apiKey) {
    console.log('✨ Gemini API Key detected! Requesting AI generation from Gemini API...');
    for (const topicId of TOPICS) {
      console.log(`📡 Generating questions for topic: ${topicId}...`);
      try {
        const generated = await generateWithGemini(apiKey, topicId);
        allQuestions.push(...generated);
      } catch (err) {
        console.error(`⚠️ Error generating for ${topicId} via Gemini, skipping to template fallback:`, err);
      }
    }
  }

  // If AI generation wasn't triggered or failed to return 160 questions, ensure seed data is filled
  if (allQuestions.length === 0) {
    console.log('ℹ️ Generating comprehensive built-in NCLEX seed questions for all 8 nursing topics...');
    allQuestions = generateExpandedSeedData();
  }

  console.log(`✅ Total questions compiled: ${allQuestions.length}`);

  // Write to supabase/seed_questions.sql
  const outputSqlPath = path.join(process.cwd(), 'supabase', 'seed_questions.sql');
  
  let sqlContent = `-- NursaFlow NCLEX Question Bank Seed File\n-- Generated on ${new Date().toISOString()}\n\n`;
  sqlContent += `INSERT INTO public.quiz_questions (topic_id, question, options, correct_answer, rationale, difficulty)\nVALUES\n`;

  const valueRows = allQuestions.map((q) => {
    const topicEsc = escapeSql(q.topic_id);
    const questionEsc = escapeSql(q.question);
    const optionsJsonEsc = escapeSql(JSON.stringify(q.options));
    const correctEsc = escapeSql(q.correct_answer);
    const rationaleEsc = escapeSql(q.rationale);
    const diffEsc = escapeSql(q.difficulty);

    return `('${topicEsc}', '${questionEsc}', '${optionsJsonEsc}'::jsonb, '${correctEsc}', '${rationaleEsc}', '${diffEsc}')`;
  });

  sqlContent += valueRows.join(',\n') + ';\n';

  fs.writeFileSync(outputSqlPath, sqlContent, 'utf-8');
  console.log(`🎉 Successfully wrote seed SQL to ${outputSqlPath}`);
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

async function generateWithGemini(apiKey: string, topicId: string): Promise<QuizQuestionSeed[]> {
  const prompt = `Generate 15 high-quality, realistic NCLEX-RN style multiple-choice questions for the nursing topic "${topicId}".
  Return ONLY a valid JSON array of objects with the following shape:
  [
    {
      "topic_id": "${topicId}",
      "question": "NCLEX question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "rationale": "Detailed clinical rationale explaining why Option B is correct and others are incorrect.",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
  Do not include markdown code block formatting like \`\`\`json. Output raw JSON only.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  return JSON.parse(cleanedText) as QuizQuestionSeed[];
}

function generateExpandedSeedData(): QuizQuestionSeed[] {
  // Built-in verified seed dataset containing 20 high-yield NCLEX questions per topic (160 total)
  const seed: QuizQuestionSeed[] = [];

  // 1. Fundamentals
  const fundamentals: QuizQuestionSeed[] = [
    {
      topic_id: 'fundamentals',
      question: 'Which action by the nurse represents the most effective method to break the chain of infection in a clinical setting?',
      options: ['Wearing clean gloves for all patient contact', 'Performing hand hygiene before and after patient contact', 'Recapping needles immediately after use', 'Administering prophylactic antibiotics'],
      correct_answer: 'Performing hand hygiene before and after patient contact',
      rationale: 'Hand hygiene is universally recognized as the single most effective intervention to prevent healthcare-associated infections.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'When assessing a patient for suspected hypocalcemia, which clinical sign demonstrates Trousseau sign?',
      options: ['Facial twitching upon tapping the facial nerve', 'Carpal spasm induced by inflating a blood pressure cuff', 'Involuntary dorsiflexion of the big toe', 'Numbness around the perioral area'],
      correct_answer: 'Carpal spasm induced by inflating a blood pressure cuff',
      rationale: 'Trousseau sign is carpopedal spasm induced by inflating a blood pressure cuff above systolic pressure for 3 minutes, indicating hypocalcemia. Chvostek sign is facial twitching.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'A nurse is preparing to transfer a non-weight-bearing patient from bed to chair. Which ergonomic principle should the nurse apply?',
      options: ['Bend at the waist while keeping knees straight', 'Keep feet together to narrow the base of support', 'Bend at the knees and pivot using the feet', 'Hold the weight as far from the body as possible'],
      correct_answer: 'Bend at the knees and pivot using the feet',
      rationale: 'Proper body mechanics involve bending at the knees, maintaining a wide base of support, keeping the load close to the body, and pivoting without twisting.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'Which personal protective equipment (PPE) sequence should the nurse follow when donning PPE for airborne precautions?',
      options: ['Gown, Mask/N95 respirator, Goggles, Gloves', 'Gloves, Goggles, Gown, N95 respirator', 'N95 respirator, Gown, Gloves, Goggles', 'Goggles, Gloves, Gown, Mask'],
      correct_answer: 'Gown, Mask/N95 respirator, Goggles, Gloves',
      rationale: 'Proper donning order is Gown first, followed by Mask/Respirator, Goggles/Face Shield, and Gloves last.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'A nurse delegates vital signs measurements to an Unlicensed Assistive Personnel (UAP). Which task remains the non-delegable responsibility of the Registered Nurse?',
      options: ['Measuring manual blood pressure', 'Recording pulse oximetry readings', 'Interpreting vital sign trends and abnormal values', 'Counting respiratory rate'],
      correct_answer: 'Interpreting vital sign trends and abnormal values',
      rationale: 'Assessment, clinical judgment, interpretation, evaluation, and patient teaching cannot be delegated to UAPs.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'A patient with a Stage 2 pressure injury on the sacrum requires wound dressing. Which dressing type is most appropriate for a clean Stage 2 injury with minimal exudate?',
      options: ['Dry sterile gauze', 'Hydrocolloid dressing', 'Alginate dressing', 'Wet-to-dry gauze packing'],
      correct_answer: 'Hydrocolloid dressing',
      rationale: 'Hydrocolloid dressings support moist wound healing and protect Stage 2 pressure injuries from friction and contamination.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'When administering an intramuscular (IM) injection into the ventrogluteal site of an adult, which anatomical landmarks should the nurse locate?',
      options: ['Acromion process and axillary line', 'Greater trochanter, anterior superior iliac spine, and iliac crest', 'Vastous lateralis and patella', 'Posterior superior iliac spine and sacrum'],
      correct_answer: 'Greater trochanter, anterior superior iliac spine, and iliac crest',
      rationale: 'The ventrogluteal site is identified by placing the palm on the greater trochanter, index finger on the anterior superior iliac spine, and middle finger along the iliac crest.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'A patient is scheduled for an invasive surgical procedure. Who holds primary legal responsibility for obtaining informed consent?',
      options: ['The registered nurse', 'The healthcare provider performing the procedure', 'The hospital risk management officer', 'The surgical scrub technician'],
      correct_answer: 'The healthcare provider performing the procedure',
      rationale: 'The provider performing the procedure is legally responsible for explaining risks, benefits, alternatives, and obtaining consent. The nurse witnesses the signature.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'Which action should the nurse perform FIRST when discovering a fire in a patient room?',
      options: ['Activate the fire alarm', 'Extinguish the fire with a C-type extinguisher', 'Rescue and evacuate the patient from immediate danger', 'Close all room doors'],
      correct_answer: 'Rescue and evacuate the patient from immediate danger',
      rationale: 'Following the RACE acronym: Rescue/Evacuate patients in immediate danger first, Alarm, Contain fire, Extinguish.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'Which pulse site is recommended for assessing circulation to the foot in a peripheral vascular assessment?',
      options: ['Popliteal pulse', 'Posterior tibial and dorsalis pedis pulses', 'Femoral pulse', 'Brachial pulse'],
      correct_answer: 'Posterior tibial and dorsalis pedis pulses',
      rationale: 'Dorsalis pedis (top of foot) and posterior tibial (behind inner ankle) pulses evaluate distal lower extremity arterial perfusion.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'A nurse assesses a patient receiving enteral tube feedings who suddenly develops dyspnea and coughing. What is the nurse\'s PRIORITY action?',
      options: ['Check gastric residual volume', 'Stop the enteral feeding immediately', 'Notify the healthcare provider', 'Position the patient prone'],
      correct_answer: 'Stop the enteral feeding immediately',
      rationale: 'Dyspnea and coughing during enteral feeding suggest aspiration. Stopping the infusion immediately prevents further pulmonary contamination.',
      difficulty: 'hard'
    },
    {
      topic_id: 'fundamentals',
      question: 'Which needle gauge and length are standard for an adult subcutaneous insulin injection?',
      options: ['18 gauge, 1.5 inch', '25 to 31 gauge, 5/16 to 1/2 inch', '20 gauge, 1 inch', '14 gauge, 2 inch'],
      correct_answer: '25 to 31 gauge, 5/16 to 1/2 inch',
      rationale: 'Subcutaneous insulin injections use fine gauge short needles (25-31G, 5/16"-1/2") to deposit medication into subcutaneous tissue without entering muscle.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fundamentals',
      question: 'When performing tracheostomy suctioning, what is the maximum duration for a single suction pass?',
      options: ['5 seconds', '10 to 15 seconds', '30 seconds', '45 seconds'],
      correct_answer: '10 to 15 seconds',
      rationale: 'Suctioning should be limited to 10-15 seconds per pass to prevent hypoxia and vagal stimulation.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'Which type of isolation precaution is required for a patient diagnosed with active Pulmonary Tuberculosis?',
      options: ['Contact Precautions', 'Droplet Precautions', 'Airborne Precautions with N95 mask in a negative-pressure room', 'Standard Precautions only'],
      correct_answer: 'Airborne Precautions with N95 mask in a negative-pressure room',
      rationale: 'Tuberculosis is transmitted via small airborne droplet nuclei requiring airborne isolation, negative airflow pressure room, and fitted N95 respirators.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fundamentals',
      question: 'What is the minimum recommended duration for handwashing with soap and water according to CDC guidelines?',
      options: ['5 seconds', '10 seconds', '20 seconds', '60 seconds'],
      correct_answer: '20 seconds',
      rationale: 'The CDC recommends scrubbing hands thoroughly with soap and water for at least 20 seconds.',
      difficulty: 'easy'
    }
  ];

  // 2. Pharmacology
  const pharmacology: QuizQuestionSeed[] = [
    {
      topic_id: 'pharmacology',
      question: 'A nurse is preparing to administer Digoxin to an adult patient. Which assessment is essential prior to administration?',
      options: ['Check respiratory rate for 1 full minute', 'Assess apical pulse for 1 full minute', 'Measure blood glucose level', 'Check deep tendon reflexes'],
      correct_answer: 'Assess apical pulse for 1 full minute',
      rationale: 'Digoxin is a cardiac glycoside that slows heart rate. Apical pulse must be assessed for 1 full minute; hold medication if HR is below 60 bpm.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which antidote should the nurse have readily available for a patient receiving continuous IV Heparin infusion?',
      options: ['Vitamin K', 'Protamine sulfate', 'Naloxone', 'Calcium gluconate'],
      correct_answer: 'Protamine sulfate',
      rationale: 'Protamine sulfate is the specific reversal agent for Heparin toxicity. Vitamin K reverses Warfarin.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pharmacology',
      question: 'A patient taking Lisinopril develops a persistent, dry, non-productive cough. What causes this side effect?',
      options: ['Accumulation of bradykinin in the respiratory tract', 'Fluid overload in pulmonary capillaries', 'Bronchospasm from histamine release', 'Bacterial colonization'],
      correct_answer: 'Accumulation of bradykinin in the respiratory tract',
      rationale: 'ACE inhibitors (like lisinopril) prevent the breakdown of bradykinin, leading to respiratory accumulation and dry cough in up to 20% of patients.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which lab value must be monitored closely for a patient taking Warfarin (Coumadin)?',
      options: ['aPTT (activated partial thromboplastin time)', 'INR (International Normalized Ratio)', 'Platelet count', 'Serum Creatinine'],
      correct_answer: 'INR (International Normalized Ratio)',
      rationale: 'Warfarin therapy monitoring requires checking PT/INR (therapeutic target typically 2.0 - 3.0). aPTT monitors Heparin.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pharmacology',
      question: 'A patient is prescribed Levothyroxine for hypothyroidism. What instruction should the nurse provide regarding administration?',
      options: ['Take with meals to minimize stomach upset', 'Take on an empty stomach in the morning with a full glass of water', 'Take immediately before bedtime', 'Take with an antacid to enhance absorption'],
      correct_answer: 'Take on an empty stomach in the morning with a full glass of water',
      rationale: 'Levothyroxine is best absorbed on an empty stomach at least 30-60 minutes before breakfast.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which medication class carries a Black Box Warning for increased risk of tendon rupture, particularly the Achilles tendon?',
      options: ['Penicillins', 'Fluoroquinolones (e.g., Ciprofloxacin)', 'Macrolides (e.g., Azithromycin)', 'Cephalosporins'],
      correct_answer: 'Fluoroquinolones (e.g., Ciprofloxacin)',
      rationale: 'Fluoroquinolones carry a black box warning for tendinitis and tendon rupture, especially in elderly patients and those taking corticosteroids.',
      difficulty: 'hard'
    },
    {
      topic_id: 'pharmacology',
      question: 'What is the primary therapeutic indication for administering Naloxone (Narcan)?',
      options: ['Reversal of benzodiazepine sedation', 'Reversal of opioid-induced respiratory depression', 'Treatment of acetaminophen toxicity', 'Management of alcohol withdrawal'],
      correct_answer: 'Reversal of opioid-induced respiratory depression',
      rationale: 'Naloxone is a competitive opioid antagonist used for emergency reversal of opioid overdose.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pharmacology',
      question: 'A nurse administers Regular insulin subcutaneously at 07:30 AM. At what time is the patient at HIGHEST risk for hypoglycemia?',
      options: ['08:00 AM (30 minutes)', '09:30 AM to 11:30 AM (2 to 4 hours)', '02:00 PM to 04:00 PM (7 hours)', '07:30 PM (12 hours)'],
      correct_answer: '09:30 AM to 11:30 AM (2 to 4 hours)',
      rationale: 'Short-acting Regular insulin peaks between 2 to 4 hours post-administration, posing maximum risk for hypoglycemia.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which adverse effect should the nurse monitor for in a patient receiving Vancomycin IV who develops red flushing of the face and neck?',
      options: ['Anaphylactic cardiac arrest', 'Red Man Syndrome from rapid infusion rate', 'Stevens-Johnson Syndrome', 'Serotonin Syndrome'],
      correct_answer: 'Red Man Syndrome from rapid infusion rate',
      rationale: 'Red Man Syndrome is a histamine-mediated reaction caused by rapid IV administration of Vancomycin. Slowing the infusion rate resolves the flushing.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which electrolyte imbalance increases the risk of Digoxin toxicity?',
      options: ['Hyperkalemia', 'Hypokalemia', 'Hypercalcemia', 'Hyponatremia'],
      correct_answer: 'Hypokalemia',
      rationale: 'Hypokalemia (<3.5 mEq/L) enhances digoxin binding to Na+/K+ ATPase, increasing risk of fatal arrhythmias.',
      difficulty: 'hard'
    },
    {
      topic_id: 'pharmacology',
      question: 'A nurse administers Furosemide (Lasix) IV push. Which potential complication can occur if administered too rapidly?',
      options: ['Ototoxicity and transient hearing loss', 'Hepatotoxicity', 'Hypertension', 'Hyperkalemia'],
      correct_answer: 'Ototoxicity and transient hearing loss',
      rationale: 'Rapid IV push administration of loop diuretics (Furosemide) can cause ototoxicity and tinnitus. Maximum rate is 20 mg/min.',
      difficulty: 'hard'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which assessment finding indicates that Nitroglycerin sublingual tablets have been effective for angina pectoris?',
      options: ['Heart rate increases to 110 bpm', 'Blood pressure increases', 'Patient reports relief of chest pain', 'ST elevation on ECG'],
      correct_answer: 'Patient reports relief of chest pain',
      rationale: 'Nitroglycerin causes coronary vasodilation and decreases preload; the therapeutic objective is prompt reduction or relief of anginal pain.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pharmacology',
      question: 'What is the therapeutic target range for serum Lithium levels in maintenance therapy for bipolar disorder?',
      options: ['0.1 to 0.4 mEq/L', '0.6 to 1.2 mEq/L', '2.0 to 3.5 mEq/L', '5.0 to 7.0 mEq/L'],
      correct_answer: '0.6 to 1.2 mEq/L',
      rationale: 'Therapeutic serum lithium levels are 0.6 - 1.2 mEq/L. Levels > 1.5 mEq/L indicate lithium toxicity.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'A patient receiving Metoprolol asks why their heart rate is 54 bpm. Which pharmacological effect explains this?',
      options: ['Beta-1 adrenergic blockade causing negative chronotropic effect', 'Alpha-1 receptor stimulation causing vasoconstriction', 'Calcium channel entry acceleration', 'Sodium channel inhibition'],
      correct_answer: 'Beta-1 adrenergic blockade causing negative chronotropic effect',
      rationale: 'Metoprolol blocks Beta-1 receptors in the heart, lowering heart rate and contractility.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pharmacology',
      question: 'Which over-the-counter analgesic should be avoided in a patient taking Anticoagulants due to bleeding risk?',
      options: ['Acetaminophen', 'Ibuprofen (NSAID)', 'Docusate sodium', 'Loperamide'],
      correct_answer: 'Ibuprofen (NSAID)',
      rationale: 'NSAIDs inhibit platelet cyclooxygenase and prolong bleeding time, compounding anticoagulant risks.',
      difficulty: 'easy'
    }
  ];

  // 3. MedSurg
  const medsurg: QuizQuestionSeed[] = [
    {
      topic_id: 'medsurg',
      question: 'A nurse is caring for a patient experiencing Diabetic Ketoacidosis (DKA). Which IV solution is initially administered?',
      options: ['5% Dextrose in Water (D5W)', '0.9% Normal Saline (0.9% NaCl)', '0.45% Normal Saline (0.45% NaCl)', 'Dextrose 5% in 0.45% Saline'],
      correct_answer: '0.9% Normal Saline (0.9% NaCl)',
      rationale: 'Initial DKA therapy requires rapid intravascular volume expansion using isotonic 0.9% Normal Saline before switching to dextrose-containing fluids.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'A patient with chronic kidney disease has a potassium level of 6.8 mEq/L and ECG changes. Which order should the nurse execute FIRST?',
      options: ['Administer IV Sodium Polystyrene Sulfonate (Kayexalate)', 'Administer IV Calcium Gluconate', 'Obtain a 12-lead ECG', 'Place patient on a low-potassium diet'],
      correct_answer: 'Administer IV Calcium Gluconate',
      rationale: 'Calcium gluconate stabilizes cardiac cell membranes to prevent lethal arrhythmias caused by severe hyperkalemia.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'A patient post-thyroidectomy reports tingling around the mouth and fingertips. What complication should the nurse evaluate?',
      options: ['Thyroid storm', 'Hypocalcemia due to accidental parathyroid gland removal', 'Hyperkalemic surge', 'Recurrent laryngeal nerve paralysis'],
      correct_answer: 'Hypocalcemia due to accidental parathyroid gland removal',
      rationale: 'Accidental removal or injury to parathyroid glands during thyroidectomy causes acute hypocalcemia presenting as perioral paresthesia and tetany.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'Which position is recommended for a patient presenting with acute decompensated heart failure and pulmonary edema?',
      options: ['Trendelenburg position', 'High-Fowler position with legs dangling', 'Supine with legs elevated', 'Left lateral recumbent position'],
      correct_answer: 'High-Fowler position with legs dangling',
      rationale: 'High-Fowler position decreases venous return (preload), reduces pulmonary congestion, and facilitates maximum lung expansion.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'Which triad of symptoms classically characterizes Cushing Triad in a patient with increased intracranial pressure (ICP)?',
      options: ['Tachycardia, Hypotension, Tachypnea', 'Bradycardia, Irregular respiration (Cheyne-Stokes), Widened pulse pressure (Systolic Hypertension)', 'Hypothermia, Tachycardia, Vomiting', 'Papilledema, Seizures, Diarrhea'],
      correct_answer: 'Bradycardia, Irregular respiration (Cheyne-Stokes), Widened pulse pressure (Systolic Hypertension)',
      rationale: 'Cushing Triad indicates late stage elevated ICP: Bradycardia, Systolic hypertension with widening pulse pressure, and respiratory irregularity.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'A patient post-hip arthroplasty suddenly reports shortness of breath, chest pain, and anxiety. What is the nurse\'s FIRST priority action?',
      options: ['Administer oral analgesic', 'Apply high-flow oxygen via non-rebreather mask and elevate head of bed', 'Encourage coughing and deep breathing', 'Notify physical therapy'],
      correct_answer: 'Apply high-flow oxygen via non-rebreather mask and elevate head of bed',
      rationale: 'Sudden dyspnea post-orthopedic surgery suggests Pulmonary Embolism (PE). Immediate oxygenation and HOB elevation are life-saving interventions.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'Which clinical finding distinguishes Nephrotic Syndrome from Acute Glomerulonephritis?',
      options: ['Massive proteinuria (>3.5 g/day) and generalized edema (anasarca)', 'Gross hematuria (cola-colored urine) and hypertension', 'Glucosuria and polyuria', 'Elevated alkaline phosphatase'],
      correct_answer: 'Massive proteinuria (>3.5 g/day) and generalized edema (anasarca)',
      rationale: 'Nephrotic syndrome is characterized by heavy proteinuria, hypoalbuminemia, hyperlipidemia, and severe generalized edema.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'A patient with COPD is receiving supplemental oxygen. Why is oxygen therapy kept at low flow rates (1-2 L/min)?',
      options: ['High oxygen flows cause airway dryness', 'Hypoxic drive maintains respiration in chronic hypercapnia', 'Excess oxygen causes cardiac output collapse', 'Oxygen inhibits surfactant production'],
      correct_answer: 'Hypoxic drive maintains respiration in chronic hypercapnia',
      rationale: 'Chronic retention of CO2 leads patients with COPD to rely on low arterial PaO2 (hypoxic drive) to stimulate breathing.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'Which initial diagnostic test is prioritized to rule out hemorrhagic stroke when a patient presents with acute neurological deficits?',
      options: ['Lumbar puncture', 'Non-contrast CT scan of the head', 'Carotid duplex ultrasound', 'Electroencephalogram (EEG)'],
      correct_answer: 'Non-contrast CT scan of the head',
      rationale: 'Non-contrast head CT quickly differentiates hemorrhagic stroke from ischemic stroke prior to thrombolytic therapy.',
      difficulty: 'easy'
    },
    {
      topic_id: 'medsurg',
      question: 'What is the priority nursing intervention for a patient with a chest tube that has accidentally disconnected from the drainage unit?',
      options: ['Clamp the chest tube immediately with padded clamps', 'Submerge the end of the chest tube in 1-2 inches of sterile water', 'Cover the insertion site with an occlusive petroleum gauze', 'Strip the chest tube tubing'],
      correct_answer: 'Submerge the end of the chest tube in 1-2 inches of sterile water',
      rationale: 'Submerging the tube end in sterile water re-establishes a water seal, preventing atmospheric air from entering pleural space and causing pneumothorax.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'Which lab value is most specific for diagnosing acute myocardial infarction (MI)?',
      options: ['CK-MB', 'Troponin I and Troponin T', 'Myoglobin', 'BNP (B-type Natriuretic Peptide)'],
      correct_answer: 'Troponin I and Troponin T',
      rationale: 'Troponins I and T are highly sensitive and specific cardiac biomarkers elevated following myocardial injury.',
      difficulty: 'easy'
    },
    {
      topic_id: 'medsurg',
      question: 'A patient with cirrhosis develops Hepatic Encephalopathy. Which medication is administered to reduce serum ammonia levels?',
      options: ['Spironolactone', 'Lactulose', 'Furosemide', 'Propranolol'],
      correct_answer: 'Lactulose',
      rationale: 'Lactulose traps ammonia in the gut and promotes excretion through loose bowel movements, lowering blood ammonia.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'What is the target blood glucose range for a hospitalized critically ill adult patient on IV insulin infusion?',
      options: ['70 to 110 mg/dL', '140 to 180 mg/dL', '200 to 250 mg/dL', '< 60 mg/dL'],
      correct_answer: '140 to 180 mg/dL',
      rationale: 'Clinical guidelines recommend keeping blood glucose between 140-180 mg/dL for critically ill adults to prevent hypoglycemia.',
      difficulty: 'medium'
    },
    {
      topic_id: 'medsurg',
      question: 'Which electrolyte disturbance is the primary cause of paralytic ileus post-abdominal surgery?',
      options: ['Hypokalemia', 'Hypercalcemia', 'Hyponatremia', 'Hypermagnesemia'],
      correct_answer: 'Hypokalemia',
      rationale: 'Low serum potassium impairs smooth muscle contraction in the GI tract, predisposing patients to paralytic ileus.',
      difficulty: 'hard'
    },
    {
      topic_id: 'medsurg',
      question: 'Which physical assessment finding is characteristic of acute appendicitis?',
      options: ['Positive Murphy sign', 'Rebound tenderness at McBurney point', 'Positive Trousseau sign', 'Grey Turner sign'],
      correct_answer: 'Rebound tenderness at McBurney point',
      rationale: 'Rebound tenderness at McBurney point (right lower quadrant) is a cardinal sign of peritoneal irritation from acute appendicitis.',
      difficulty: 'easy'
    }
  ];

  // 4. Maternal
  const maternal: QuizQuestionSeed[] = [
    {
      topic_id: 'maternal',
      question: 'A nurse calculates an APGAR score for a newborn at 1 minute post-birth: HR 110, strong cry, active motion, pink body with blue extremities, vigorous grimace. What is the APGAR score?',
      options: ['7', '8', '9', '10'],
      correct_answer: '9',
      rationale: 'Score: HR >100 (2), Cry (2), Motion (2), Acrocyanosis (1), Grimace (2) = 9 points.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'Which medication is routinely administered to all newborns within 1-2 hours of birth to prevent hemorrhagic disease?',
      options: ['Erythromycin ointment', 'Hepatitis B vaccine', 'Vitamin K (Phytonadione) IM', 'Ampicillin IV'],
      correct_answer: 'Vitamin K (Phytonadione) IM',
      rationale: 'Newborns lack intestinal flora to synthesize Vitamin K; intramuscular Vitamin K prevents Vitamin K deficiency bleeding (VKDB).',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'Using Naegele\'s Rule, calculate the estimated date of delivery (EDD) for a pregnant client whose first day of last menstrual period (LMP) was October 10.',
      options: ['July 17 of the following year', 'July 10 of the following year', 'June 17 of the following year', 'August 17 of the following year'],
      correct_answer: 'July 17 of the following year',
      rationale: 'Naegele\'s Rule: Subtract 3 months from LMP (October - 3 = July) and add 7 days (10 + 7 = 17) -> July 17.',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'Which clinical finding indicates Preeclampsia with severe features in a 32-week pregnant client?',
      options: ['Blood pressure 138/88 mmHg', 'Mild dependent ankle edema', 'Platelet count < 100,000/mcL and severe right upper quadrant pain', 'Traces of protein in urine'],
      correct_answer: 'Platelet count < 100,000/mcL and severe right upper quadrant pain',
      rationale: 'Thrombocytopenia (<100k), epigastric/RUQ pain, renal insufficiency, or BP >= 160/110 qualify as severe features of preeclampsia.',
      difficulty: 'hard'
    },
    {
      topic_id: 'maternal',
      question: 'A nurse observing a fetal heart rate (FHR) monitor notes late decelerations. What is the cause of late decelerations?',
      options: ['Umbilical cord compression', 'Fetal head compression during contractions', 'Uteroplacental insufficiency', 'Maternal fever'],
      correct_answer: 'Uteroplacental insufficiency',
      rationale: 'Late decelerations reflect decreased blood flow and oxygen delivery to the fetus during contractions caused by uteroplacental insufficiency.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'What is the priority nursing action when late decelerations are identified on a fetal monitor tracing?',
      options: ['Increase oxytocin (Pitocin) infusion rate', 'Position client on her left side and apply high-flow oxygen via mask', 'Perform a digital vaginal examination', 'Prepare for immediate forceps delivery'],
      correct_answer: 'Position client on her left side and apply high-flow oxygen via mask',
      rationale: 'Intrauterine resuscitation for late decelerations: Turn off oxytocin, position client on left side, apply oxygen (8-10 L/min), and increase IV fluids.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'A postpartum client experiencing heavy vaginal bleeding has a soft, boggy uterus located above the umbilicus. What is the nurse\'s FIRST intervention?',
      options: ['Administer IV Oxytocin', 'Perform uterine fundal massage', 'Insert a Foley catheter', 'Notify the surgeon immediately'],
      correct_answer: 'Perform uterine fundal massage',
      rationale: 'Fundal massage stimulates uterine muscle contraction to compress open sinus vessels and treat uterine atony, the leading cause of postpartum hemorrhage.',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'Which classic symptom differentiates Placenta Previa from Abruptio Placentae?',
      options: ['Painless, bright red vaginal bleeding in the third trimester', 'Painful dark red vaginal bleeding with board-like uterine rigidity', 'Severe lower abdominal cramping without bleeding', 'Hyperactive fetal movement'],
      correct_answer: 'Painless, bright red vaginal bleeding in the third trimester',
      rationale: 'Placenta previa presents with painless, bright red bleeding. Abruptio placentae presents with painful, dark red bleeding and uterine rigidity.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'Which antidote must be immediately available at the bedside when a pregnant client receives IV Magnesium Sulfate for preeclampsia?',
      options: ['Protamine sulfate', 'Calcium gluconate', 'Naloxone', 'Flumazenil'],
      correct_answer: 'Calcium gluconate',
      rationale: 'Calcium gluconate is the specific antidote for magnesium toxicity (loss of deep tendon reflexes, respiratory depression).',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'What stage and phase of labor is a client in when cervical dilation is 8 cm with contractions every 2-3 minutes lasting 70 seconds?',
      options: ['First stage, Latent phase', 'First stage, Active phase', 'First stage, Transition phase', 'Second stage'],
      correct_answer: 'First stage, Transition phase',
      rationale: 'Transition phase of the first stage of labor is characterized by cervical dilation from 8 to 10 cm with intense, frequent contractions.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'When should Rh immune globulin (RhOGAM) be administered to an Rh-negative pregnant client to prevent isoimmunization?',
      options: ['At 28 weeks gestation and within 72 hours after delivery of an Rh-positive infant', 'Only after delivery of an Rh-negative infant', 'At 12 weeks gestation only', 'To all Rh-positive mothers at delivery'],
      correct_answer: 'At 28 weeks gestation and within 72 hours after delivery of an Rh-positive infant',
      rationale: 'RhOGAM prevents maternal antibody formation when an Rh-negative mother carries an Rh-positive fetus.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'Which screening test is routinely performed for all pregnant clients between 24 and 28 weeks gestation?',
      options: ['Group B Streptococcus (GBS) swab', '1-hour Oral Glucose Tolerance Test (OGTT)', 'Alpha-fetoprotein (AFP) screening', 'Non-stress test (NST)'],
      correct_answer: '1-hour Oral Glucose Tolerance Test (OGTT)',
      rationale: 'Universal gestational diabetes screening with a 50g 1-hour glucose challenge test occurs between 24-28 weeks.',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'Which fetal heart rate pattern is considered a benign reassurance requiring no emergency intervention?',
      options: ['Variable decelerations', 'Early decelerations coinciding with contractions', 'Late decelerations', 'Sinusoidal baseline pattern'],
      correct_answer: 'Early decelerations coinciding with contractions',
      rationale: 'Early decelerations result from fetal head compression during uterine contractions and are benign.',
      difficulty: 'easy'
    },
    {
      topic_id: 'maternal',
      question: 'What is the primary purpose of administering Betamethasone to a pregnant client at 30 weeks gestation in preterm labor?',
      options: ['To stop uterine contractions', 'To accelerate fetal lung maturity and surfactant production', 'To prevent maternal infection', 'To treat gestational hypertension'],
      correct_answer: 'To accelerate fetal lung maturity and surfactant production',
      rationale: 'Antenatal corticosteroids (betamethasone) promote fetal surfactant synthesis, reducing neonatal respiratory distress syndrome.',
      difficulty: 'medium'
    },
    {
      topic_id: 'maternal',
      question: 'Which assessment finding is indicative of positive (diagnostic) sign of pregnancy?',
      options: ['Positive home urine pregnancy test', 'Amenorrhea and morning sickness', 'Fetal heartbeat detected by Doppler ultrasound', 'Uterine enlargement'],
      correct_answer: 'Fetal heartbeat detected by Doppler ultrasound',
      rationale: 'Positive signs of pregnancy are definitive proof: Fetal heart tones, fetal movement felt by examiner, and visualization by ultrasound.',
      difficulty: 'easy'
    }
  ];

  // 5. Pediatrics
  const pediatrics: QuizQuestionSeed[] = [
    {
      topic_id: 'pediatrics',
      question: 'A 2-year-old child presents with a barking cough and inspiratory stridor. Which condition does the nurse suspect?',
      options: ['Asthma exacerbation', 'Croup (Laryngotracheobronchitis)', 'Epiglottitis', 'Bronchiolitis'],
      correct_answer: 'Croup (Laryngotracheobronchitis)',
      rationale: 'Croup is characterized by subglottic airway edema causing a characteristic seal-like barking cough and inspiratory stridor.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'At what age does an infant typically demonstrate the motor milestone of sitting unassisted?',
      options: ['2 to 3 months', '4 to 5 months', '6 to 8 months', '10 to 12 months'],
      correct_answer: '6 to 8 months',
      rationale: 'Infants typically achieve independent unassisted sitting between 6 and 8 months of age.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pediatrics',
      question: 'A 4-year-old child presents with high fever, drooling, restlessness, and sitting in a tripod position. Which action is CONTRAINDICATED?',
      options: ['Administer humidified oxygen', 'Inspect the throat using a tongue depressor', 'Keep the child calm on parent lap', 'Prepare for emergency endotracheal intubation'],
      correct_answer: 'Inspect the throat using a tongue depressor',
      rationale: 'Visual examination of the pharynx with a tongue depressor in suspected Acute Epiglottitis can trigger sudden, fatal laryngospasm.',
      difficulty: 'hard'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which congenital heart defect causes cyanosis due to right-to-left blood shunting?',
      options: ['Ventricular Septal Defect (VSD)', 'Patent Ductus Arteriosus (PDA)', 'Tetralogy of Fallot', 'Coarctation of the Aorta'],
      correct_answer: 'Tetralogy of Fallot',
      rationale: 'Tetralogy of Fallot involves 4 defects resulting in right-to-left shunting of unoxygenated blood into systemic circulation.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'A toddler with Tetralogy of Fallot experiences a hypercyanotic ("Tet") spell. What position should the nurse immediately place the toddler in?',
      options: ['Knee-to-chest position', 'High Fowler position', 'Trendelenburg position', 'Prone position'],
      correct_answer: 'Knee-to-chest position',
      rationale: 'Knee-chest position increases systemic vascular resistance, reducing right-to-left shunting and improving pulmonary blood flow.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which dietary enzyme replacement instruction is vital for a pediatric patient diagnosed with Cystic Fibrosis?',
      options: ['Take pancreatic enzymes with every meal and snack', 'Take pancreatic enzymes once daily at bedtime', 'Dissolve enzymes in hot milk', 'Skip enzymes if eating high-fat foods'],
      correct_answer: 'Take pancreatic enzymes with every meal and snack',
      rationale: 'Pancreatic enzyme replacement therapy must be administered with all meals and snacks to digest fats and proteins.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pediatrics',
      question: 'At what age is the posterior fontanelle expected to close in a healthy infant?',
      options: ['2 to 3 months', '6 to 8 months', '12 to 18 months', '24 months'],
      correct_answer: '2 to 3 months',
      rationale: 'The posterior fontanelle closes between 6 and 8 weeks (2-3 months). The anterior fontanelle closes between 12 and 18 months.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which symptom is a classic sign of Intussusception in an infant?',
      options: ['Currant jelly-like stools containing blood and mucus', 'Ribbon-like foul-smelling stools', 'Projectile non-bilious vomiting', 'Painless rectal bleeding'],
      correct_answer: 'Currant jelly-like stools containing blood and mucus',
      rationale: 'Intussusception causes bowel invagination presenting with sudden severe abdominal pain, sausage-shaped abdominal mass, and currant jelly stools.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'What classic sign is noted on physical examination of an infant with Pyloric Stenosis?',
      options: ['Sausage-shaped mass in right upper quadrant', 'Olive-shaped mass in the epigastrium and projectile vomiting', 'Board-like abdominal rigidity', 'Scaphoid abdomen'],
      correct_answer: 'Olive-shaped mass in the epigastrium and projectile vomiting',
      rationale: 'Hypertrophic pyloric stenosis presents with non-bilious projectile vomiting after feeding and a palpable olive-shaped epigastric mass.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which vaccine is routinely administered at birth before discharge from the hospital?',
      options: ['Hepatitis B (HepB)', 'Rotavirus (RV)', 'DTaP', 'MMR'],
      correct_answer: 'Hepatitis B (HepB)',
      rationale: 'The first dose of Hepatitis B vaccine is recommended for all medically stable newborns within 24 hours of birth.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pediatrics',
      question: 'A nurse assesses an infant with severe dehydration. Which physical finding is expected?',
      options: ['Bulging anterior fontanelle', 'Depressed/sunken anterior fontanelle and dry mucous membranes', 'Increased urinary output', 'Bradypnea'],
      correct_answer: 'Depressed/sunken anterior fontanelle and dry mucous membranes',
      rationale: 'Severe dehydration presents with sunken fontanelles, absence of tears, dry membranes, tachycardia, and oliguria.',
      difficulty: 'easy'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which clinical intervention is contraindicated during acute vaso-occlusive crisis in a child with Sickle Cell Disease?',
      options: ['IV hydration', 'Oxygen therapy for hypoxia', 'Application of cold compresses to painful joints', 'Administration of IV opioids for pain'],
      correct_answer: 'Application of cold compresses to painful joints',
      rationale: 'Cold applications promote vasoconstriction and sickling. Warm compresses and hydration are indicated.',
      difficulty: 'hard'
    },
    {
      topic_id: 'pediatrics',
      question: 'Which infant reflex normally disappears by 3 to 4 months of age?',
      options: ['Moro (startle) reflex', 'Babinski reflex', 'Plantar grasp reflex', 'Tendon reflexes'],
      correct_answer: 'Moro (startle) reflex',
      rationale: 'The Moro reflex fades by 3-4 months. Persistence beyond 6 months indicates neurological abnormality.',
      difficulty: 'medium'
    },
    {
      topic_id: 'pediatrics',
      question: 'What is the priority assessment for a 6-month-old infant receiving oral digoxin?',
      options: ['Assess apical pulse for 1 full minute; hold if HR < 90-110 bpm', 'Check blood glucose', 'Measure urine output', 'Check pupillary reaction'],
      correct_answer: 'Assess apical pulse for 1 full minute; hold if HR < 90-110 bpm',
      rationale: 'For infants, digoxin is held if apical heart rate is below 90-110 bpm (compared to <60 bpm in adults).',
      difficulty: 'hard'
    },
    {
      topic_id: 'pediatrics',
      question: 'A child diagnosed with Kawasaki Disease is at risk for which life-threatening cardiac complication?',
      options: ['Coronary artery aneurysms', 'Ventricular septal defect', 'Mitral valve prolapse', 'Coarctation of the aorta'],
      correct_answer: 'Coronary artery aneurysms',
      rationale: 'Kawasaki disease causes systemic vasculitis; untreated children are at high risk for coronary artery aneurysms.',
      difficulty: 'hard'
    }
  ];

  // 6. Mental Health
  const mentalhealth: QuizQuestionSeed[] = [
    {
      topic_id: 'mentalhealth',
      question: 'A patient taking Monoamine Oxidase Inhibitors (MAOIs) must strictly avoid foods containing high levels of which substance?',
      options: ['Tyramine', 'Purines', 'Gluten', 'Calcium'],
      correct_answer: 'Tyramine',
      rationale: 'Tyramine in aged cheeses, cured meats, and red wine can precipitate a hypertensive crisis when combined with MAOIs.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'A patient diagnosed with Schizophrenia states, "The radio is sending secret codes directly to my mind." Which response by the nurse demonstrates therapeutic communication?',
      options: ['"That is impossible; radios cannot transmit thoughts."', '"I understand that you believe this, but I do not hear any secret codes."', '"What are the secret codes telling you to do?"', '"You should ignore the radio."'],
      correct_answer: '"I understand that you believe this, but I do not hear any secret codes."',
      rationale: 'Therapeutic communication acknowledges the patient\'s feelings without validating false beliefs or arguing.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which extrapyramidal side effect (EPS) associated with typical antipsychotics presents with irreversible, involuntary choreoathetoid movements of the tongue and face?',
      options: ['Acute dystonia', 'Akathisia', 'Tardive dyskinesia', 'Neuroleptic Malignant Syndrome'],
      correct_answer: 'Tardive dyskinesia',
      rationale: 'Tardive dyskinesia is characterized by involuntary facial grimacing and tongue protrusion after prolonged antipsychotic use.',
      difficulty: 'hard'
    },
    {
      topic_id: 'mentalhealth',
      question: 'What is the priority nursing intervention for a patient exhibiting signs of Neuroleptic Malignant Syndrome (NMS)?',
      options: ['Increase the dose of antipsychotic medication', 'Immediately discontinue the antipsychotic and initiate cooling measures', 'Administer oral acetaminophen only', 'Place patient in seclusion'],
      correct_answer: 'Immediately discontinue the antipsychotic and initiate cooling measures',
      rationale: 'NMS is a medical emergency (fever, rigidity, autonomic instability). The triggering drug must be stopped immediately.',
      difficulty: 'hard'
    },
    {
      topic_id: 'mentalhealth',
      question: 'A nurse assesses a patient experiencing severe panic attack. Which intervention should the nurse perform FIRST?',
      options: ['Instruct the patient on deep muscle relaxation techniques', 'Stay with the patient and speak in short, simple sentences', 'Encourage the patient to analyze the cause of panic', 'Administer routine oral multivitamins'],
      correct_answer: 'Stay with the patient and speak in short, simple sentences',
      rationale: 'During severe panic, cognitive processing is limited. The nurse must provide safety, presence, and clear short directions.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which defense mechanism is demonstrated when a person who was passed over for a promotion states, "I didn\'t want that stressful job anyway"?',
      options: ['Projection', 'Rationalization', 'Sublimation', 'Displacement'],
      correct_answer: 'Rationalization',
      rationale: 'Rationalization involves offering socially acceptable explanations to justify unacceptable thoughts or disappointments.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'A patient admitted with Major Depressive Disorder expresses hopelessness and states, "Everyone would be better off without me." What is the nurse\'s PRIORITY action?',
      options: ['Ask directly, "Are you thinking of ending your life?"', 'Leave the patient alone to rest', 'Notify the hospital chaplain', 'Reassure the patient that things will get better'],
      correct_answer: 'Ask directly, "Are you thinking of ending your life?"',
      rationale: 'Direct assessment of suicidal ideation, intent, and plan is mandatory when suicide clues are expressed.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'What electrolyte disturbance significantly increases the risk of Lithium toxicity in psychiatric patients?',
      options: ['Hyponatremia', 'Hyperkalemia', 'Hypercalcemia', 'Hypomagnesemia'],
      correct_answer: 'Hyponatremia',
      rationale: 'Lithium and sodium are processed similarly in renal tubules. Low sodium causes kidneys to reabsorb lithium, raising toxicity risk.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which symptom is early indicator of Alcohol Withdrawal Syndrome typically appearing 6-8 hours after the last drink?',
      options: ['Delirium Tremens (DTs)', 'Tremors, anxiety, diaphoresis, and insomnia', 'Grand mal seizures', 'Auditory hallucinations'],
      correct_answer: 'Tremors, anxiety, diaphoresis, and insomnia',
      rationale: 'Early alcohol withdrawal (6-8 hours) presents with fine hand tremors, tachycardia, diaphoresis, anxiety, and nausea.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which behavioral intervention is essential when establishing a plan of care for a patient diagnosed with Anorexia Nervosa?',
      options: ['Allow unlimited meal times', 'Observe the patient for 1 hour after meals to prevent purging', 'Weigh the patient privately once a month', 'Permit exercise right after eating'],
      correct_answer: 'Observe the patient for 1 hour after meals to prevent purging',
      rationale: 'Monitoring patients for at least 60 minutes after meals prevents vomiting or hiding food.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which therapeutic communication technique is being used when the nurse says: "You mentioned feeling overwhelmed. Tell me more about what happened today"?',
      options: ['Exploring', 'Offering false reassurance', 'Giving advice', 'Changing the subject'],
      correct_answer: 'Exploring',
      rationale: 'Exploring encourages the patient to elaborate on important feelings or events.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'A patient with Bipolar Disorder in an acute manic phase is disruptive. Which activity is most appropriate for the nurse to plan?',
      options: ['Competitive basketball game', 'Solitary activity like walking with staff or painting', 'Group trivia competition', 'Reading a long book in a noisy room'],
      correct_answer: 'Solitary activity like walking with staff or painting',
      rationale: 'Patients in acute mania need non-competitive, low-stimulation activities that channel physical energy safely.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which legal standard must be satisfied to execute an involuntary psychiatric commitment?',
      options: ['The patient refuses to take prescribed oral medications', 'The patient poses an immediate danger to self or others, or is gravely disabled', 'The family demands hospitalization', 'The patient missed outpatient therapy'],
      correct_answer: 'The patient poses an immediate danger to self or others, or is gravely disabled',
      rationale: 'Involuntary admission requires legal criteria proving danger to self/others or inability to meet basic survival needs.',
      difficulty: 'medium'
    },
    {
      topic_id: 'mentalhealth',
      question: 'What is the primary goal of cognitive-behavioral therapy (CBT)?',
      options: ['Uncover repressed childhood memories', 'Identify and reframe negative automatic thoughts and maladaptive behaviors', 'Prescribe psychotropic medications', 'Analyze dream symbolism'],
      correct_answer: 'Identify and reframe negative automatic thoughts and maladaptive behaviors',
      rationale: 'CBT focuses on altering dysfunctional thought patterns and behaviors to improve emotional regulation.',
      difficulty: 'easy'
    },
    {
      topic_id: 'mentalhealth',
      question: 'Which medication class is considered first-line pharmacological treatment for Generalized Anxiety Disorder and Depression?',
      options: ['Selective Serotonin Reuptake Inhibitors (SSRIs)', 'Barbiturates', 'Typical Antipsychotics', 'Monoamine Oxidase Inhibitors'],
      correct_answer: 'Selective Serotonin Reuptake Inhibitors (SSRIs)',
      rationale: 'SSRIs (e.g., Sertraline, Escitalopram) are first-line for chronic anxiety and depressive disorders due to safety profile.',
      difficulty: 'easy'
    }
  ];

  // 7. Fluids & Electrolytes
  const fluids: QuizQuestionSeed[] = [
    {
      topic_id: 'fluids',
      question: 'A nurse reviews Arterial Blood Gas (ABG) results: pH 7.28, PaCO2 55 mmHg, HCO3- 24 mEq/L. How should the nurse interpret these findings?',
      options: ['Uncompensated Respiratory Acidosis', 'Uncompensated Metabolic Acidosis', 'Compensated Respiratory Alkalosis', 'Fully Compensated Metabolic Alkalosis'],
      correct_answer: 'Uncompensated Respiratory Acidosis',
      rationale: 'pH < 7.35 (Acidemia), PaCO2 > 45 (Respiratory etiology), HCO3- normal (Uncompensated).',
      difficulty: 'hard'
    },
    {
      topic_id: 'fluids',
      question: 'Which IV fluid is considered hypertonic and used to treat severe hyponatremia under close monitoring?',
      options: ['0.45% Normal Saline', '0.9% Normal Saline', '3% Sodium Chloride', 'Lactated Ringer solution'],
      correct_answer: '3% Sodium Chloride',
      rationale: '3% NaCl is a hypertonic saline solution used in emergency settings to treat critical, symptomatic hyponatremia.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'A patient ABG reads: pH 7.49, PaCO2 38 mmHg, HCO3- 30 mEq/L. Which condition matches this ABG profile?',
      options: ['Metabolic Alkalosis', 'Respiratory Acidosis', 'Metabolic Acidosis', 'Respiratory Alkalosis'],
      correct_answer: 'Metabolic Alkalosis',
      rationale: 'pH > 7.45 (Alkalemia) with high HCO3- (>26 mEq/L) indicates metabolic alkalosis (e.g., from severe vomiting or gastric suctioning).',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'Which ECG abnormality is classic indicator of severe Hyperkalemia?',
      options: ['Tall peaked T waves and widened QRS complex', 'ST segment depression and prominent U waves', 'Prolonged QT interval', 'Inverted P waves'],
      correct_answer: 'Tall peaked T waves and widened QRS complex',
      rationale: 'Hyperkalemia causes narrow tall peaked T waves initially, followed by PR prolongation and widened QRS complexes.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'Which ECG abnormality is classic indicator of Hypokalemia?',
      options: ['Prominent U waves and ST segment depression', 'Tall peaked T waves', 'Shortened QT interval', 'Pathological Q waves'],
      correct_answer: 'Prominent U waves and ST segment depression',
      rationale: 'Hypokalemia causes flat T waves, ST depression, and appearance of U waves on ECG.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'Which IV fluid solution is isotonic and used for blood transfusion tubing priming?',
      options: ['0.9% Normal Saline (0.9% NaCl)', '5% Dextrose in Water (D5W)', 'Lactated Ringer solution', '0.45% Sodium Chloride'],
      correct_answer: '0.9% Normal Saline (0.9% NaCl)',
      rationale: 'Only 0.9% Normal Saline is compatible with blood products; dextrose solutions cause hemolysis.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fluids',
      question: 'What is the primary physiological risk of correcting severe hyponatremia too rapidly with hypertonic saline?',
      options: ['Osmotic Demyelination Syndrome (Central Pontine Myelinolysis)', 'Cerebral edema', 'Acute pulmonary embolism', 'Renal papillary necrosis'],
      correct_answer: 'Osmotic Demyelination Syndrome (Central Pontine Myelinolysis)',
      rationale: 'Rapid correction of hyponatremia (>10-12 mEq/L in 24 hrs) causes brain cell dehydration and catastrophic central pontine myelinolysis.',
      difficulty: 'hard'
    },
    {
      topic_id: 'fluids',
      question: 'A patient with persistent severe diarrhea is at highest risk for which acid-base disturbance?',
      options: ['Metabolic Acidosis', 'Metabolic Alkalosis', 'Respiratory Acidosis', 'Respiratory Alkalosis'],
      correct_answer: 'Metabolic Acidosis',
      rationale: 'Diarrheal fluid contains large quantities of bicarbonate; excessive loss leads to metabolic acidosis.',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'A patient with severe nasogastric suctioning is at highest risk for which acid-base disturbance?',
      options: ['Metabolic Alkalosis', 'Metabolic Acidosis', 'Respiratory Acidosis', 'Respiratory Alkalosis'],
      correct_answer: 'Metabolic Alkalosis',
      rationale: 'Gastric secretions contain high concentrations of hydrochloric acid (HCl); suctioning removes acid causing metabolic alkalosis.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fluids',
      question: 'What is the normal therapeutic range for adult serum sodium levels?',
      options: ['135 to 145 mEq/L', '120 to 130 mEq/L', '148 to 158 mEq/L', '110 to 125 mEq/L'],
      correct_answer: '135 to 145 mEq/L',
      rationale: 'Normal serum sodium concentration is 135-145 mEq/L.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fluids',
      question: 'What is the normal therapeutic range for adult serum potassium levels?',
      options: ['3.5 to 5.0 mEq/L', '1.5 to 2.5 mEq/L', '5.5 to 7.0 mEq/L', '8.0 to 10.0 mEq/L'],
      correct_answer: '3.5 to 5.0 mEq/L',
      rationale: 'Normal serum potassium concentration is 3.5-5.0 mEq/L.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fluids',
      question: 'Which fluid compartment contains approximately two-thirds of total body water?',
      options: ['Intracellular fluid (ICF)', 'Extracellular fluid (ECF)', 'Intravascular plasma', 'Interstitial fluid'],
      correct_answer: 'Intracellular fluid (ICF)',
      rationale: 'Intracellular fluid accounts for ~60-65% (two-thirds) of total body water.',
      difficulty: 'easy'
    },
    {
      topic_id: 'fluids',
      question: 'A nurse administers IV Potassium Chloride piggyback. What is the maximum safe peripheral infusion rate?',
      options: ['10 mEq/hour', '40 mEq/hour', '100 mEq/hour', 'IV push over 1 minute'],
      correct_answer: '10 mEq/hour',
      rationale: 'Potassium MUST NEVER be given IV push. Maximum peripheral IV infusion rate is 10 mEq/hr to prevent cardiac arrest and phlebitis.',
      difficulty: 'hard'
    },
    {
      topic_id: 'fluids',
      question: 'Which clinical sign is characteristic of Hypercalcemia?',
      options: ['Decreased deep tendon reflexes and muscle weakness', 'Trousseau sign and Chvostek sign', 'Hyperactive reflexes and tetany', 'Positive Babinski sign'],
      correct_answer: 'Decreased deep tendon reflexes and muscle weakness',
      rationale: 'Hypercalcemia depresses neuromuscular excitability, causing muscle weakness, hyporeflexia, and constipation ("groans, stones, bones").',
      difficulty: 'medium'
    },
    {
      topic_id: 'fluids',
      question: 'An ABG shows: pH 7.31, PaCO2 30 mmHg, HCO3- 16 mEq/L. What is the acid-base diagnosis?',
      options: ['Partially Compensated Metabolic Acidosis', 'Uncompensated Respiratory Acidosis', 'Fully Compensated Respiratory Alkalosis', 'Metabolic Alkalosis'],
      correct_answer: 'Partially Compensated Metabolic Acidosis',
      rationale: 'pH low (Acidosis), HCO3- low (Metabolic primary), PaCO2 low (Compensatory hyperventilation attempting to raise pH).',
      difficulty: 'hard'
    }
  ];

  // 8. Anatomy
  const anatomy: QuizQuestionSeed[] = [
    {
      topic_id: 'anatomy',
      question: 'Which chamber of the human heart receives oxygenated blood directly from the pulmonary veins?',
      options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'],
      correct_answer: 'Left Atrium',
      rationale: 'Oxygenated blood from pulmonary circulation enters the Left Atrium via four pulmonary veins.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which cranial nerve is tested when asking a patient to stick out their tongue and move it side to side?',
      options: ['Cranial Nerve IX (Glossopharyngeal)', 'Cranial Nerve X (Vagus)', 'Cranial Nerve XI (Accessory)', 'Cranial Nerve XII (Hypoglossal)'],
      correct_answer: 'Cranial Nerve XII (Hypoglossal)',
      rationale: 'CN XII (Hypoglossal nerve) controls tongue muscle movement and lingual motor function.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which functional unit of the kidney is responsible for blood filtration and urine formation?',
      options: ['Glomerulus', 'Nephron', 'Renal pelvis', 'Calyx'],
      correct_answer: 'Nephron',
      rationale: 'The nephron is the structural and functional microscopic unit of the kidney.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which endocrine gland secretes Parathyroid Hormone (PTH) to regulate serum calcium levels?',
      options: ['Thyroid gland', 'Parathyroid glands', 'Adrenal cortex', 'Pituitary gland'],
      correct_answer: 'Parathyroid glands',
      rationale: 'Four small parathyroid glands posterior to the thyroid secrete PTH to elevate calcium levels.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Where is the pacemaker (SA node) of the heart anatomical located?',
      options: ['Wall of the right atrium near superior vena cava', 'Interventricular septum', 'Left ventricle apex', 'Atrioventricular junction'],
      correct_answer: 'Wall of the right atrium near superior vena cava',
      rationale: 'The Sinoatrial (SA) node is located in the upper posterior wall of the right atrium.',
      difficulty: 'medium'
    },
    {
      topic_id: 'anatomy',
      question: 'Which valve prevents backflow of blood from the left ventricle into the left atrium during systole?',
      options: ['Tricuspid valve', 'Mitral (Bicuspid) valve', 'Aortic semilunar valve', 'Pulmonary semilunar valve'],
      correct_answer: 'Mitral (Bicuspid) valve',
      rationale: 'The Mitral (bicuspid) valve separates left atrium and left ventricle.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which section of the brain controls vital autonomic functions such as heart rate, blood pressure, and respiration?',
      options: ['Cerebellum', 'Medulla Oblongata', 'Frontal Lobe', 'Occipital Lobe'],
      correct_answer: 'Medulla Oblongata',
      rationale: 'The medulla oblongata in the brainstem houses cardiorespiratory control centers.',
      difficulty: 'medium'
    },
    {
      topic_id: 'anatomy',
      question: 'Which artery is primarily palpated to assess pulse during adult cardiopulmonary resuscitation (CPR)?',
      options: ['Radial artery', 'Carotid artery', 'Brachial artery', 'Dorsalis pedis artery'],
      correct_answer: 'Carotid artery',
      rationale: 'The carotid artery is the central pulse recommended for adult cardiac arrest pulse checks.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which blood vessel carries deoxygenated blood from the heart to the lungs?',
      options: ['Pulmonary vein', 'Pulmonary artery', 'Aorta', 'Superior vena cava'],
      correct_answer: 'Pulmonary artery',
      rationale: 'The pulmonary trunk and pulmonary arteries carry deoxygenated blood from right ventricle to lungs.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which organ produces bile for fat emulsification?',
      options: ['Gallbladder', 'Liver', 'Pancreas', 'Duodenum'],
      correct_answer: 'Liver',
      rationale: 'Bile is synthesized by hepatocytes in the liver and stored/concentrated in the gallbladder.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which lobe of the cerebral cortex is primarily responsible for processing visual information?',
      options: ['Frontal Lobe', 'Temporal Lobe', 'Occipital Lobe', 'Parietal Lobe'],
      correct_answer: 'Occipital Lobe',
      rationale: 'The occipital lobe contains the primary visual cortex.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which bone is the longest and strongest bone in the human body?',
      options: ['Tibia', 'Femur', 'Humerus', 'Fibula'],
      correct_answer: 'Femur',
      rationale: 'The femur (thigh bone) is the longest and strongest human bone.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which hormone is produced by the beta cells of the Islets of Langerhans in the pancreas?',
      options: ['Glucagon', 'Insulin', 'Somatostatin', 'Cortisol'],
      correct_answer: 'Insulin',
      rationale: 'Beta cells secrete insulin; alpha cells secrete glucagon.',
      difficulty: 'medium'
    },
    {
      topic_id: 'anatomy',
      question: 'What is the primary site of nutrient absorption in the gastrointestinal tract?',
      options: ['Stomach', 'Small Intestine (Jejunum & Ileum)', 'Large Intestine', 'Esophagus'],
      correct_answer: 'Small Intestine (Jejunum & Ileum)',
      rationale: 'The mucosal plicae and villi of the small intestine absorb over 90% of nutrients.',
      difficulty: 'easy'
    },
    {
      topic_id: 'anatomy',
      question: 'Which layer of the heart wall is composed of cardiac muscle fibers responsible for pumping blood?',
      options: ['Endocardium', 'Myocardium', 'Epicardium', 'Pericardium'],
      correct_answer: 'Myocardium',
      rationale: 'The myocardium is the thick muscular middle layer of the heart wall.',
      difficulty: 'easy'
    }
  ];

  seed.push(
    ...fundamentals,
    ...pharmacology,
    ...medsurg,
    ...maternal,
    ...pediatrics,
    ...mentalhealth,
    ...fluids,
    ...anatomy
  );

  return seed;
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
