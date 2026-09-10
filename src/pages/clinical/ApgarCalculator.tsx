import React, { useState } from 'react';
import { Baby } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const ApgarCalculator: React.FC = () => {
  const [appearance, setAppearance] = useState<number>(2);
  const [pulse, setPulse] = useState<number>(2);
  const [grimace, setGrimace] = useState<number>(2);
  const [activity, setActivity] = useState<number>(2);
  const [respiration, setRespiration] = useState<number>(2);

  const totalApgar = appearance + pulse + grimace + activity + respiration;

  const getApgarInterpretation = (score: number) => {
    if (score <= 3) {
      return {
        label: 'Severely Depressed (Score 0 - 3)',
        action: 'CRITICAL: Immediate neonatal resuscitation & airway clearance required!',
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      };
    }
    if (score <= 6) {
      return {
        label: 'Moderately Depressed (Score 4 - 6)',
        action: 'Tactile stimulation, suctioning & supplemental oxygen support required.',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      };
    }
    return {
      label: 'Normal / Excellent Transition (Score 7 - 10)',
      action: 'Routine post-birth newborn care, drying & skin-to-skin bonding.',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    };
  };

  const inter = getApgarInterpretation(totalApgar);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Baby className="w-8 h-8 text-purple-500" />
          <span>APGAR Score Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Assess newborn extrauterine adaptation at 1 minute & 5 minutes post birth.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <div className={`p-4 rounded-2xl border text-center space-y-1 ${inter.color}`}>
          <span className="text-xs font-bold uppercase tracking-wider">
            Total APGAR Score (0 - 10)
          </span>
          <h2 className="text-5xl font-extrabold">
            {totalApgar} <span className="text-xl font-bold">/ 10</span>
          </h2>
          <p className="text-sm font-bold uppercase tracking-wider pt-1">
            {inter.label}
          </p>
          <p className="text-xs font-medium italic mt-1">
            {inter.action}
          </p>
        </div>

        <div className="space-y-4">
          <Select
            label="1. Appearance (Skin Color)"
            value={appearance}
            onChange={(e) => setAppearance(Number(e.target.value))}
            options={[
              { value: 2, label: '2 - Completely pink' },
              { value: 1, label: '1 - Body pink, extremities blue (Acrocyanosis)' },
              { value: 0, label: '0 - Pale or blue all over' },
            ]}
          />

          <Select
            label="2. Pulse (Heart Rate)"
            value={pulse}
            onChange={(e) => setPulse(Number(e.target.value))}
            options={[
              { value: 2, label: '2 - > 100 beats per minute' },
              { value: 1, label: '1 - < 100 beats per minute' },
              { value: 0, label: '0 - Absent heart rate' },
            ]}
          />

          <Select
            label="3. Grimace (Reflex Irritability)"
            value={grimace}
            onChange={(e) => setGrimace(Number(e.target.value))}
            options={[
              { value: 2, label: '2 - Vigorous cry, sneeze, or cough' },
              { value: 1, label: '1 - Grimace / feeble cry to stimulation' },
              { value: 0, label: '0 - No response to stimulation' },
            ]}
          />

          <Select
            label="4. Activity (Muscle Tone)"
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
            options={[
              { value: 2, label: '2 - Active spontaneous motion & flexed limbs' },
              { value: 1, label: '1 - Some flexion of arms and legs' },
              { value: 0, label: '0 - Limp / flaccid muscle tone' },
            ]}
          />

          <Select
            label="5. Respiration (Breathing Effort)"
            value={respiration}
            onChange={(e) => setRespiration(Number(e.target.value))}
            options={[
              { value: 2, label: '2 - Good strong vigorous cry' },
              { value: 1, label: '1 - Slow, weak, or irregular breathing' },
              { value: 0, label: '0 - Absent breathing (Apnea)' },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};
