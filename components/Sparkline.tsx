
import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = '#6366f1' }) => {
  if (!data || data.length < 2) return <div className="w-16 h-4 bg-slate-800/50 rounded animate-pulse" />;

  const width = 60;
  const height = 16;
  const padding = 2;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = ((100 - val) / 100) * (height - padding * 2) + padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Indicator for the current point */}
      <circle 
        cx={(width - padding)} 
        cy={((100 - data[data.length-1]) / 100) * (height - padding * 2) + padding} 
        r="2" 
        fill={color}
      />
    </svg>
  );
};

export default Sparkline;
