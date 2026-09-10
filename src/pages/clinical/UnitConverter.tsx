import React, { useState } from 'react';
import { ArrowLeftRight, RefreshCcw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const UnitConverter: React.FC = () => {
  const [conversionType, setConversionType] = useState<'mass' | 'volume' | 'temp'>('mass');
  const [value, setValue] = useState<number | ''>(1000);
  const [fromUnit, setFromUnit] = useState<string>('mg');
  const [toUnit, setToUnit] = useState<string>('g');

  const numVal = Number(value) || 0;

  const calculateConversion = (): number => {
    if (conversionType === 'mass') {
      // Base unit: mg
      let baseMg = numVal;
      if (fromUnit === 'g') baseMg = numVal * 1000;
      if (fromUnit === 'mcg') baseMg = numVal / 1000;
      if (fromUnit === 'kg') baseMg = numVal * 1000000;

      if (toUnit === 'g') return baseMg / 1000;
      if (toUnit === 'mcg') return baseMg * 1000;
      if (toUnit === 'kg') return baseMg / 1000000;
      return baseMg;
    }

    if (conversionType === 'volume') {
      if (fromUnit === 'mL' && toUnit === 'L') return numVal / 1000;
      if (fromUnit === 'L' && toUnit === 'mL') return numVal * 1000;
      return numVal;
    }

    if (conversionType === 'temp') {
      if (fromUnit === '°C' && toUnit === '°F') return (numVal * 9) / 5 + 32;
      if (fromUnit === '°F' && toUnit === '°C') return ((numVal - 32) * 5) / 9;
      return numVal;
    }

    return numVal;
  };

  const convertedResult = calculateConversion();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-amber-500" />
          <span>Nursing Unit Converter</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bidirectional unit conversions for clinical mass, volume & temperature values.
        </p>
      </div>

      <DisclaimerBanner />

      <Card className="space-y-6 p-6 sm:p-8">
        <Select
          label="Conversion Metric"
          value={conversionType}
          onChange={(e) => {
            const type = e.target.value as any;
            setConversionType(type);
            if (type === 'mass') { setFromUnit('mg'); setToUnit('g'); }
            if (type === 'volume') { setFromUnit('mL'); setToUnit('L'); }
            if (type === 'temp') { setFromUnit('°C'); setToUnit('°F'); }
          }}
          options={[
            { value: 'mass', label: 'Mass / Weight (mg, g, mcg, kg)' },
            { value: 'volume', label: 'Volume (mL, L)' },
            { value: 'temp', label: 'Temperature (°C, °F)' },
          ]}
        />

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Converted Result
          </span>
          <h2 className="text-4xl font-extrabold text-amber-600 dark:text-amber-300">
            {convertedResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xl font-bold">{toUnit}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {numVal} {fromUnit} = {convertedResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <Input
            label="Input Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <Select
            label="From Unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            options={
              conversionType === 'mass'
                ? [
                    { value: 'mg', label: 'Milligrams (mg)' },
                    { value: 'g', label: 'Grams (g)' },
                    { value: 'mcg', label: 'Micrograms (mcg)' },
                    { value: 'kg', label: 'Kilograms (kg)' },
                  ]
                : conversionType === 'volume'
                ? [
                    { value: 'mL', label: 'Milliliters (mL)' },
                    { value: 'L', label: 'Liters (L)' },
                  ]
                : [
                    { value: '°C', label: 'Celsius (°C)' },
                    { value: '°F', label: 'Fahrenheit (°F)' },
                  ]
            }
          />

          <Select
            label="To Unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            options={
              conversionType === 'mass'
                ? [
                    { value: 'g', label: 'Grams (g)' },
                    { value: 'mg', label: 'Milligrams (mg)' },
                    { value: 'mcg', label: 'Micrograms (mcg)' },
                    { value: 'kg', label: 'Kilograms (kg)' },
                  ]
                : conversionType === 'volume'
                ? [
                    { value: 'L', label: 'Liters (L)' },
                    { value: 'mL', label: 'Milliliters (mL)' },
                  ]
                : [
                    { value: '°F', label: 'Fahrenheit (°F)' },
                    { value: '°C', label: 'Celsius (°C)' },
                  ]
            }
          />
        </div>
      </Card>
    </div>
  );
};
