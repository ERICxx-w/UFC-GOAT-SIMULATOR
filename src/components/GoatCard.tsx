'use client';

import StatBar from './StatBar';
import type { GenerateResult } from '@/types';

interface Props {
  result: GenerateResult;
  weightLabel: string;
}

const STATS = [
  { key: 'striking'   as const, label: '站立打击', en: 'STRIKING',   icon: '👊', delay: 0   },
  { key: 'wrestling'  as const, label: '摔跤',     en: 'WRESTLING',  icon: '🤼', delay: 80  },
  { key: 'bjj'        as const, label: '柔术',     en: 'BJJ',        icon: '🥋', delay: 160 },
  { key: 'fightIQ'    as const, label: '战术智商', en: 'FIGHT IQ',   icon: '🧠', delay: 240 },
  { key: 'durability' as const, label: '扛打能力', en: 'DURABILITY', icon: '🛡️', delay: 320 },
];

function ovrColor(ovr: number) {
  if (ovr >= 97) return 'text-yellow-200';
  if (ovr >= 93) return 'text-yellow-400';
  if (ovr >= 88) return 'text-green-400';
  return 'text-blue-400';
}

function tier(ovr: number) {
  if (ovr >= 97) return 'S+ TIER';
  if (ovr >= 93) return 'S TIER';
  if (ovr >= 90) return 'A+ TIER';
  if (ovr >= 85) return 'A TIER';
  if (ovr >= 80) return 'B+ TIER';
  return 'B TIER';
}

export default function GoatCard({ result, weightLabel }: Props) {
  const { ovr, goatName, era, stats } = result;

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent
                      border-b border-[#2a2a3a] p-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.2em] text-yellow-500/70 font-bold mb-1">
            GENERATED GOAT
          </div>
          <h2 className="text-2xl font-black text-white truncate">{goatName}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/25
                             rounded text-yellow-400 text-[11px] font-bold tracking-wide">
              {era}
            </span>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10
                             rounded text-gray-400 text-[11px] tracking-wide">
              {weightLabel}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] text-gray-600 tracking-widest mb-0.5">OVR</div>
          <div className={`text-5xl font-black leading-none ${ovrColor(ovr)}`}>{ovr}</div>
          <div className={`text-[11px] font-bold mt-1 tracking-widest ${ovrColor(ovr)}`}>
            {tier(ovr)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        {STATS.map(s => (
          <StatBar
            key={s.key}
            label={s.label}
            en={s.en}
            icon={s.icon}
            value={stats[s.key].value}
            source={stats[s.key].source}
            delay={s.delay}
          />
        ))}
      </div>

      {/* Formula */}
      <div className="px-5 pb-5">
        <div className="bg-[#0a0a10] rounded-xl p-3 text-[11px] text-gray-600 text-center tracking-wide">
          OVR = 站立×25% + 摔跤×25% + 柔术×20% + 智商×20% + 抗打×10%
        </div>
      </div>
    </div>
  );
}
