import React, { useState } from 'react';
import { Pill, Calculator, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const DosageCalculator: React.FC = () => {
  const [requiredDose, setRequiredDose] = useState<number | ''>(500);
  const [availableDose, setAvailableDose] = useState<number | ''>(250);
  const [availableVolume, setAvailableVolume] = useState<number | ''>(5);
  const [unit, setUnit] = useState<string>('mL');

  const req = Number(requiredDose) || 0;
  const avail = Number(availableDose) || 0;
  const vol = Number(availableVolume) || 0;

  const result = avail > 0 ? (req / avail) * vol : 0;

  const handleReset = () => {
    setRequiredDose(500);
    setAvailableDose(250);
    setAvailableVolume(5);
    setUnit('mL');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Pill className="w-8 h-8 text-teal-500" />
          <span>Drug Dosage Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculate liquid or oral tablet administration based on provider order & stock supply.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center space-y-1">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Calculated Amount to Administer
          </span>
          <h2 className="text-4xl font-extrabold text-brand-600 dark:text-brand-300">
            {result.toFixed(2)} <span className="text-xl font-bold">{unit}</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Formula: ({req} / {avail}) × {vol} = {result.toFixed(2)} {unit}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Required Dose (Desired)"
            type="number"
            value={requiredDose}
            onChange={(e) => setRequiredDose(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 500"
          />

          <Input
            label="Available Dose (On Hand)"
            type="number"
            value={availableDose}
            onChange={(e) => setAvailableDose(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 250"
          />

          <Input
            label="Available Volume"
            type="number"
            value={availableVolume}
            onChange={(e) => setAvailableVolume(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 5"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" icon={RefreshCw} onClick={handleReset}>
            Reset Values
          </Button>
        </div>
      </Card>
    </div>
  );
};
