import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Stethoscope,
  Pill,
  Activity,
  Scale,
  Brain,
  Baby,
  ArrowLeftRight,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { DisclaimerBanner } from '../../components/feedback/DisclaimerBanner';

export const ClinicalToolsDashboard: React.FC = () => {
  const tools = [
    {
      title: 'Drug Dosage Calculator',
      desc: 'Calculate exact medication amounts based on required dose, stock dose & liquid volume.',
      path: '/clinical/dosage',
      icon: Pill,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    },
    {
      title: 'IV Flow Rate Calculator',
      desc: 'Calculate IV infusion drops per minute (gtt/min) based on volume, time & drop factor.',
      path: '/clinical/iv-flow',
      icon: Activity,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'BMI Calculator',
      desc: 'Body Mass Index calculator with WHO weight categories & health range indicators.',
      path: '/clinical/bmi',
      icon: Scale,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    {
      title: 'Glasgow Coma Scale (GCS)',
      desc: 'Assess level of consciousness across Eye, Verbal & Motor responses.',
      path: '/clinical/gcs',
      icon: Brain,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    },
    {
      title: 'APGAR Score Calculator',
      desc: 'Newborn physical assessment score (0-10) evaluated at 1 & 5 minutes post birth.',
      path: '/clinical/apgar',
      icon: Baby,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
    {
      title: 'Nursing Unit Converter',
      desc: 'Instant conversions for mass (mg, g, mcg), volume (mL, L) & temperature (°C, °F).',
      path: '/clinical/converter',
      icon: ArrowLeftRight,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>Clinical Calculators & Nursing Tools</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Precision calculators engineered for nursing clinical practice, OSCE preparation & dosage drills.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <NavLink key={tool.path} to={tool.path}>
              <Card hoverable className="h-full flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className={`p-3 rounded-2xl border w-fit ${tool.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
