import React, { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const IvFlowCalculator: React.FC = () => {
  const [volumeMl, setVolumeMl] = useState<number | ''>(1000);
  const [timeHours, setTimeHours] = useState<number | ''>(8);
  const [dropFactor, setDropFactor] = useState<number>(15);

  const vol = Number(volumeMl) || 0;
  const hrs = Number(timeHours) || 0;

  const totalMinutes = hrs * 60;
  const dropsPerMin = totalMinutes > 0 ? (vol * dropFactor) / totalMinutes : 0;
  const mlPerHour = hrs > 0 ? vol / hrs : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          <span>IV Flow Rate Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculate IV drip infusion rates in drops per minute (gtt/min) & mL/hr.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Drip Rate (gtt/min)
            </span>
            <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-300">
              {Math.round(dropsPerMin)} <span className="text-xl font-bold">gtt/min</span>
            </h2>
          </div>

          <div className="sm:border-l sm:border-blue-500/20 sm:pl-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Infusion Rate (mL/hr)
            </span>
            <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-300">
              {mlPerHour.toFixed(1)} <span className="text-xl font-bold">mL/hr</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Total Volume (mL)"
            type="number"
            value={volumeMl}
            onChange={(e) => setVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <Input
            label="Infusion Time (Hours)"
            type="number"
            value={timeHours}
            onChange={(e) => setTimeHours(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <Select
            label="Tubing Drop Factor (gtt/mL)"
            value={dropFactor}
            onChange={(e) => setDropFactor(Number(e.target.value))}
            options={[
              { value: 10, label: '10 gtt/mL (Macrodrip)' },
              { value: 15, label: '15 gtt/mL (Standard Macrodrip)' },
              { value: 20, label: '20 gtt/mL (Macrodrip)' },
              { value: 60, label: '60 gtt/mL (Microdrip / Pediatric)' },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};
