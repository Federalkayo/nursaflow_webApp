import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const BmiCalculator: React.FC = () => {
  const [weightKg, setWeightKg] = useState<number | ''>(70);
  const [heightCm, setHeightCm] = useState<number | ''>(175);

  const w = Number(weightKg) || 0;
  const hMeters = (Number(heightCm) || 0) / 100;

  const bmi = hMeters > 0 ? w / (hMeters * hMeters) : 0;

  const getCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { category: 'Underweight', color: 'text-sky-500 bg-sky-500/10' };
    if (bmiVal < 25.0) return { category: 'Normal Weight', color: 'text-emerald-500 bg-emerald-500/10' };
    if (bmiVal < 30.0) return { category: 'Overweight', color: 'text-amber-500 bg-amber-500/10' };
    if (bmiVal < 35.0) return { category: 'Obesity Class I', color: 'text-orange-500 bg-orange-500/10' };
    if (bmiVal < 40.0) return { category: 'Obesity Class II', color: 'text-rose-500 bg-rose-500/10' };
    return { category: 'Obesity Class III (Severe)', color: 'text-purple-500 bg-purple-500/10' };
  };

  const catInfo = getCategory(bmi);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Scale className="w-8 h-8 text-emerald-500" />
          <span>Body Mass Index (BMI) Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculate patient Body Mass Index & evaluate WHO body weight categories.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <div className={`p-4 rounded-2xl border text-center space-y-1 ${catInfo.color}`}>
          <span className="text-xs font-bold uppercase tracking-wider">
            Calculated BMI Score
          </span>
          <h2 className="text-4xl font-extrabold">
            {bmi.toFixed(1)} <span className="text-xl font-bold">kg/m²</span>
          </h2>
          <p className="text-sm font-bold uppercase tracking-wider">
            Category: {catInfo.category}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Patient Weight (kg)"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <Input
            label="Patient Height (cm)"
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </Card>
    </div>
  );
};
