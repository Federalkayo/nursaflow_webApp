import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/50 p-4 sm:p-5 text-amber-950 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Educational & Clinical Support Disclaimer
          </h4>
          <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            These calculators and nursing tools are designed strictly for educational practice and academic support. They do <strong>not</strong> replace clinical judgment, institutional facility protocols, qualified healthcare professional assessment, or prescriber orders. Always verify dosages and flow rates with licensed preceptors or official medication guides.
          </p>
        </div>
      </div>
    </div>
  );
};
