import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const GcsCalculator: React.FC = () => {
  const [eye, setEye] = useState<number>(4);
  const [verbal, setVerbal] = useState<number>(5);
  const [motor, setMotor] = useState<number>(6);

  const totalGcs = eye + verbal + motor;

  const getGcsSeverity = (score: number) => {
    if (score <= 8) {
      return {
        label: 'Severe Brain Injury / Coma (GCS ≤ 8)',
        alert: 'CRITICAL: GCS ≤ 8 requires immediate airway protection & intubation considerations!',
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      };
    }
    if (score <= 12) {
      return {
        label: 'Moderate Brain Injury (GCS 9-12)',
        alert: 'Close neurological monitoring & CT imaging recommended.',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      };
    }
    return {
      label: 'Minor / Normal Neurological State (GCS 13-15)',
      alert: 'Alert and oriented neurological function.',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    };
  };

  const severity = getGcsSeverity(totalGcs);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-500" />
          <span>Glasgow Coma Scale (GCS) Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Objective neurological assessment of consciousness following acute head trauma.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <div className={`p-4 rounded-2xl border text-center space-y-1 ${severity.color}`}>
          <span className="text-xs font-bold uppercase tracking-wider">
            Total GCS Score (3 - 15)
          </span>
          <h2 className="text-5xl font-extrabold">
            {totalGcs} <span className="text-xl font-bold">/ 15</span>
          </h2>
          <p className="text-sm font-bold uppercase tracking-wider pt-1">
            {severity.label}
          </p>
          <p className="text-xs font-medium italic mt-1">
            {severity.alert}
          </p>
        </div>

        <div className="space-y-4">
          <Select
            label="1. Eye Opening Response (E)"
            value={eye}
            onChange={(e) => setEye(Number(e.target.value))}
            options={[
              { value: 4, label: '4 - Spontaneous eye opening' },
              { value: 3, label: '3 - To sound / verbal command' },
              { value: 2, label: '2 - To pressure / painful stimulus' },
              { value: 1, label: '1 - No eye opening' },
            ]}
          />

          <Select
            label="2. Verbal Response (V)"
            value={verbal}
            onChange={(e) => setVerbal(Number(e.target.value))}
            options={[
              { value: 5, label: '5 - Oriented to time, place, and person' },
              { value: 4, label: '4 - Confused speech' },
              { value: 3, label: '3 - Inappropriate words' },
              { value: 2, label: '2 - Incomprehensible sounds' },
              { value: 1, label: '1 - No verbal response' },
            ]}
          />

          <Select
            label="3. Motor Response (M)"
            value={motor}
            onChange={(e) => setMotor(Number(e.target.value))}
            options={[
              { value: 6, label: '6 - Obeys commands' },
              { value: 5, label: '5 - Localizes painful stimulus' },
              { value: 4, label: '4 - Normal flexion (withdrawal from pain)' },
              { value: 3, label: '3 - Abnormal flexion (Decorticate posture)' },
              { value: 2, label: '2 - Extension (Decerebrate posture)' },
              { value: 1, label: '1 - No motor response (Flaccid)' },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};
