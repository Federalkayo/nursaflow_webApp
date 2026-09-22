// Maps free-text subject strings from each dataset onto the topic_id values
// that already exist in the live `topics` table (fundamentals, pharmacology,
// medsurg, maternal, pediatrics, mentalhealth, fluids, anatomy).
//
// Anything that doesn't match a known nursing topic falls back to
// 'fundamentals' rather than being silently dropped or invented as a new
// topic id that the frontend filter dropdown doesn't know about.

const FALLBACK_TOPIC = 'fundamentals';

// AfriMed-QA "specialty" values -> topic_id
const AFRIMEDQA_SPECIALTY_MAP: Record<string, string> = {
  Obstetrics_and_Gynecology: 'maternal',
  Pediatrics: 'pediatrics',
  Psychiatry: 'mentalhealth',
  Cardiology: 'medsurg',
  Internal_Medicine: 'medsurg',
  Endocrinology: 'medsurg',
  Pulmonary_Medicine: 'medsurg',
  Gastroenterology: 'medsurg',
  Nephrology: 'fluids',
  General_Surgery: 'medsurg',
  Infectious_Disease: 'medsurg',
  Family_Medicine: 'fundamentals',
  Emergency_Medicine: 'medsurg',
  Hematology: 'medsurg',
  Geriatrics: 'medsurg',
};

/**
 * MedNurse-QA's `chapter` column is empty for nearly every row (confirmed
 * after the first full import — do not rely on it). `book` IS reliably
 * populated (e.g. "nursing fundamentals", "nursing pharmacology") but its
 * exact value set across all ~21.6k rows hasn't been fully enumerated, so
 * this matches by keyword substring rather than an exact lookup table —
 * more robust to book-name variants we haven't seen yet.
 */
export function mapMedNurseTopic(book: string, chapter?: string): string {
  const text = `${book} ${chapter || ''}`.toLowerCase();

  if (text.includes('pharmacology') || text.includes('medication') || text.includes('dosage')) {
    return 'pharmacology';
  }
  if (text.includes('mental health') || text.includes('psychiatric') || text.includes('behavioral health')) {
    return 'mentalhealth';
  }
  if (text.includes('maternal') || text.includes('newborn') || text.includes('obstetric')) {
    return 'maternal';
  }
  if (text.includes('pediatric') || text.includes('child health')) {
    return 'pediatrics';
  }
  if (text.includes('fluid') || text.includes('electrolyte') || text.includes('acid-base')) {
    return 'fluids';
  }
  if (text.includes('anatomy') || text.includes('physiology')) {
    return 'anatomy';
  }
  if (
    text.includes('health alteration') ||
    text.includes('medical-surgical') ||
    text.includes('med-surg') ||
    text.includes('adult health') ||
    text.includes('end of life') ||
    text.includes('oncology')
  ) {
    return 'medsurg';
  }

  // "nursing fundamentals", "nursing skills", "nursing nutrition",
  // "diverse populations", and anything unrecognized:
  return FALLBACK_TOPIC;
}

export function mapAfriMedQaTopic(specialty: string): string {
  return AFRIMEDQA_SPECIALTY_MAP[specialty] || FALLBACK_TOPIC;
}
