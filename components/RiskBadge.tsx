
import React from 'react';
import { RiskLevel } from '../types';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    // Softer, WCAG compliant colors for better readability
    [RiskLevel.GREEN]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [RiskLevel.YELLOW]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [RiskLevel.RED]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const labels = {
    [RiskLevel.GREEN]: 'Stable',
    [RiskLevel.YELLOW]: 'Caution',
    [RiskLevel.RED]: 'Risky',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
};

export default RiskBadge;
