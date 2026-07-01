'use client';

import { useState, useEffect } from 'react';

interface Props {
  label: string;
  en: string;
  icon: string;
  value: number;
  source: string;
  delay?: number;
}

function barColor(v: number) {
  if (v >= 95) return 'from-yellow-300 to-yellow-200';
  if (v >= 90) return 'from-yellow-500 to-yellow-400';
  if (v >= 85) return 'from-green-400 to-green-300';
  if (v >= 80) return 'from-green-600 to-green-500';
  if (v >= 75) return 'from-blue-500 to-blue-400';
  return 'from-gray-500 to-gray-400';
}

function grade(v: number): string {
  if (v >= 95) return 'S+';
  if (v >= 90) return 'S';
  if (v >= 85) return 'A+';
  if (v >= 80) return 'A';
  if (v >= 75) return 'B+';
  if (v >= 70) return 'B';
  if (v >= 65) return 'C+';
  return 'C';
}

function gradeColor(v: number) {
  if (v >= 95) return 'text-yellow-300';
  if (v >= 90) return 'text-yellow-400';
  if (v >= 85) return 'text-green-400';
  if (v >= 80) return 'text-green-500';
  return 'text-gray-400';
}

export default function StatBar({ label, en, icon, value, source, delay = 0 }: Props) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-sm font-semibold text-gray-200">{label}</span>
          <span className="text-[11px] text-gray-600 font-medium tracking-wide">{en}</span>
        </div>
        <span className={`text-lg font-black tabular-nums ${gradeColor(value)}`}>{grade(value)}</span>
      </div>

      <div className="h-[6px] bg-[#1e1e2e] rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor(value)} transition-all duration-[1100ms] ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="text-[11px] text-gray-600">
        来自：<span className="text-gray-400">{source}</span>
      </div>
    </div>
  );
}
