import { Quiz } from '../types';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz_pharm_nclex',
    title: 'Pharmacology High-Yield NCLEX Practice Quiz',
    subjectId: 'subj_pharm',
    subjectTitle: 'Pharmacology',
    durationMinutes: 10,
    questions: [
      {
        id: 'q_1',
        subjectId: 'subj_pharm',
        question: 'A client prescribed furosemide (Lasix) 40 mg PO daily reports feeling weak and lightheaded. Which laboratory result requires immediate nursing action?',
        options: [
          'Serum Potassium level of 2.9 mEq/L',
          'Serum Sodium level of 137 mEq/L',
          'Blood Urea Nitrogen (BUN) of 18 mg/dL',
          'Serum Creatinine of 0.9 mg/dL'
        ],
        correctAnswerIndex: 0,
        explanation: 'Furosemide is a loop diuretic that causes potassium wasting. A serum potassium level below 3.5 mEq/L (2.9 mEq/L) is severe hypokalemia, placing the client at risk for fatal cardiac dysrhythmias.'
      },
      {
        id: 'q_2',
        subjectId: 'subj_pharm',
        question: 'A nurse is caring for a client receiving regular insulin IV infusion for diabetic ketoacidosis (DKA). Which protocol should the nurse anticipate as blood glucose drops near 250 mg/dL?',
        options: [
          'Discontinue the insulin infusion immediately.',
          'Add 5% Dextrose (D5W) to the IV fluids to prevent cerebral edema.',
          'Administer Subcutaneous Glucagon 1 mg.',
          'Double the insulin drip rate.'
        ],
        correctAnswerIndex: 1,
        explanation: 'When blood glucose reaches 250-300 mg/dL in DKA treatment, dextrose (D5W or D5 0.45% NS) is added to IV fluids. This prevents rapid glucose drops that trigger cerebral edema and severe hypoglycemia while allowing insulin infusion to continue resolving ketoacidosis.'
      },
      {
        id: 'q_3',
        subjectId: 'subj_pharm',
        question: 'Which teaching point is essential for a client prescribed Warfarin (Coumadin)?',
        options: [
          'Maintain a consistent intake of green leafy vegetables high in Vitamin K.',
          'Increase consumption of spinach and kale to improve clotting.',
          'Take Aspirin over-the-counter whenever headaches occur.',
          'Skip doses if minor bruising appears on upper extremities.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Vitamin K antagonizes warfarin\'s anticoagulant effect. Clients must keep Vitamin K dietary intake consistent (not drastically increased or eliminated) to maintain stable INR therapy values (2.0 - 3.0).'
      },
      {
        id: 'q_4',
        subjectId: 'subj_pharm',
        question: 'A nurse prepares to administer Vancomycin IV. Which adverse event is directly associated with infusing Vancomycin too rapidly?',
        options: [
          'Red Man Syndrome (Flushing, rash, hypotension)',
          'Cushingoid Syndrome',
          'Graves Disease Exacerbation',
          'Trousseau Sign'
        ],
        correctAnswerIndex: 0,
        explanation: 'Rapid IV infusion of Vancomycin triggers histamine release causing Red Man Syndrome (facial/neck erythema, pruritus, hypotension). Vancomycin should be infused over at least 60 minutes.'
      }
    ]
  },
  {
    id: 'quiz_medsurg_cardio',
    title: 'Med-Surg: Cardiovascular & Heart Failure Mastery',
    subjectId: 'subj_medsurg',
    subjectTitle: 'Medical-Surgical Nursing',
    durationMinutes: 12,
    questions: [
      {
        id: 'q_5',
        subjectId: 'subj_medsurg',
        question: 'A nurse assesses a client admitted with acute decompensated heart failure. Which finding indicates worsening fluid volume overload?',
        options: [
          'Weight gain of 3 lbs (1.4 kg) over 24 hours and bilateral 3+ pitting ankle edema',
          'Blood pressure change from 120/80 to 118/76 mmHg',
          'Serum Sodium level of 140 mEq/L',
          'Clear bilateral breath sounds throughout all lung fields'
        ],
        correctAnswerIndex: 0,
        explanation: 'Sudden weight gain (>2-3 lbs in a day or 5 lbs in a week) is the single most sensitive indicator of acute fluid retention in heart failure clients.'
      },
      {
        id: 'q_6',
        subjectId: 'subj_medsurg',
        question: 'What is the immediate priority nursing action for a post-op thyroidectomy client exhibiting stridor and muscle spasms?',
        options: [
          'Assess for hypocalcemia (Trousseau/Chvostek sign) and prepare IV Calcium Gluconate',
          'Administer IV Furosemide',
          'Encourage deep breathing exercises',
          'Reposition client in prone position'
        ],
        correctAnswerIndex: 0,
        explanation: 'Accidental damage or removal of the parathyroid glands during thyroidectomy causes acute hypocalcemia leading to laryngospasm (stridor) and tetany. IV Calcium Gluconate must be readily accessible.'
      }
    ]
  }
];
