import { NursingNote } from '../types';

export const INITIAL_NOTES: NursingNote[] = [
  {
    id: 'note_1',
    title: 'Cranial Nerves Memory Mnemonics',
    subjectId: 'subj_ana_phs',
    category: 'Anatomy & Physiology',
    content: `## Cranial Nerves Mnemonic (Names & Types)

**Mnemonic for Names:**
*"Oh Oh Oh To Touch And Feel Very Good Velvet, Such Heaven!"*

1. **I - Olfactory** (Smell)
2. **II - Optic** (Vision)
3. **III - Oculomotor** (Eye movement & pupil constriction)
4. **IV - Trochlear** (Eye movement down/in)
5. **V - Trigeminal** (Facial sensation & mastication)
6. **VI - Abducens** (Lateral eye movement)
7. **VII - Facial** (Facial expressions & anterior 2/3 taste)
8. **VIII - Vestibulocochlear** (Hearing & balance)
9. **IX - Glossopharyngeal** (Posterior 1/3 taste & swallowing)
10. **X - Vagus** (Parasympathetic innervation to heart & digestive tract)
11. **XI - Accessory** (Shoulder shrug & head rotation)
12. **XII - Hypoglossal** (Tongue movement)

**Mnemonic for Functional Type (Sensory / Motor / Both):**
*"Some Say Marry Money But My Brother Says Big Brains Matter More"*
(S = Sensory, M = Motor, B = Both)`,
    createdAt: '2026-09-02',
    updatedAt: '2026-09-08',
    isBookmarked: true,
    tags: ['Anatomy', 'Mnemonics', 'NCLEX-Prep'],
  },
  {
    id: 'note_2',
    title: 'Antihypertensive Medication Classifications',
    subjectId: 'subj_pharm',
    category: 'Pharmacology',
    content: `## Antihypertensive Summary Guide

### 1. ACE Inhibitors (Suffix: "-pril")
* **Examples**: Lisinopril, Enalapril, Captopril.
* **Mechanism**: Blocks conversion of Angiotensin I to Angiotensin II.
* **Side Effects**: Dry nagging cough (bradykinin breakdown blocked), Hyperkalemia, Angioedema.

### 2. ARBs (Suffix: "-sartan")
* **Examples**: Losartan, Valsartan.
* **Mechanism**: Blocks Angiotensin II AT1 receptors.
* **Note**: No cough side effect! Alternative for clients intolerant to ACE inhibitors.

### 3. Beta Blockers (Suffix: "-olol")
* **Examples**: Metoprolol, Atenolol, Propranolol.
* **Mechanism**: Blocks Beta-1 receptors on the heart (decreases HR and BP).
* **Warning**: Non-selective beta blockers (Propranolol) trigger bronchospasm in Asthma / COPD clients!`,
    createdAt: '2026-09-04',
    updatedAt: '2026-09-07',
    isBookmarked: true,
    tags: ['Pharmacology', 'Cardiology', 'Drug-Suffixes'],
  },
  {
    id: 'note_3',
    title: 'ABG Interpretation Made Easy (ROME Method)',
    subjectId: 'subj_patho',
    category: 'Pathophysiology',
    content: `## Arterial Blood Gas (ABG) Normal Values

* **pH**: 7.35 - 7.45
* **PaCO2**: 35 - 45 mmHg (Respiratory indicator)
* **HCO3-**: 22 - 26 mEq/L (Metabolic indicator)

## ROME Rule:
* **R**espiratory **O**pposite: pH ↑ & PaCO2 ↓ = Respiratory Alkalosis. pH ↓ & PaCO2 ↑ = Respiratory Acidosis.
* **M**etabolic **E**qual: pH ↑ & HCO3 ↑ = Metabolic Alkalosis. pH ↓ & HCO3 ↓ = Metabolic Acidosis.`,
    createdAt: '2026-09-06',
    updatedAt: '2026-09-06',
    isBookmarked: false,
    tags: ['ABG', 'Pathophysiology', 'Clinical-Skills'],
  },
];
