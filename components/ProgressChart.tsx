
import React from 'react';
import { ProgressLog } from '../types';

interface ProgressChartProps {
  data: ProgressLog[];
  label: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, label }) => {
  if (data.length < 2) return <div className="h-32 flex items-center justify-center text-gray-600 italic text-xs border border-dashed border-white/10 rounded-3xl">دیتای کافی برای رسم نمودار وجود ندارد</div>;

  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 2;
  const max = Math.max(...weights) + 2;
  const range = max - min;
  
  const width = 400;
  const height = 150;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / (data.length - 1));
    const y = height - padding - ((d.weight - min) * (height - 2 * padding) / range);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex justify-between px-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
        <span>{label}</span>
        <span className="text-cyan-400">{data[data.length-1].weight}kg</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        <polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding) / (data.length - 1));
          const y = height - padding - ((d.weight - min) * (height - 2 * padding) / range);
          return <circle key={i} cx={x} cy={y} r="4" fill="#0a0a0c" stroke="#22d3ee" strokeWidth="2" />;
        })}
      </svg>
    </div>
  );
};

export default ProgressChart;
