
import React from 'react';
import { RiskLevel } from '../types';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    [RiskLevel.GREEN]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [RiskLevel.YELLOW]: 'bg-amber-100 text-amber-700 border-amber-200',
    [RiskLevel.RED]: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const labels = {
    [RiskLevel.GREEN]: 'Stable',
    [RiskLevel.YELLOW]: 'Caution',
    [RiskLevel.RED]: 'Risky',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
};

export default RiskBadge;
