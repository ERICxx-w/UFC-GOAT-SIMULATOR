'use client';

import type { Fighter } from '@/types';

const ROWS = [
  { key: 'striking'   as const, icon: '👊', label: 'STR' },
  { key: 'wrestling'  as const, icon: '🤼', label: 'WRE' },
  { key: 'bjj'        as const, icon: '🥋', label: 'BJJ' },
  { key: 'fightIQ'    as const, icon: '🧠', label: 'IQ ' },
  { key: 'durability' as const, icon: '🛡️', label: 'DUR' },
];

function valColor(v: number) {
  if (v >= 95) return 'text-yellow-300';
  if (v >= 88) return 'text-yellow-500';
  if (v >= 80) return 'text-green-400';
  return 'text-gray-500';
}

function miniBar(v: number) {
  return (
    <div className="w-full h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

interface Props {
  fighter: Fighter;
  highlightStat?: string;
}

export default function FighterCard({ fighter, highlightStat }: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(fighter));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      className="group bg-[#111118] border border-[#2a2a3a] rounded-xl p-3
                 cursor-grab select-none
                 hover:border-yellow-400/50 hover:bg-[#17172a] hover:shadow-[0_0_12px_rgba(255,215,0,0.08)]
                 active:cursor-grabbing active:scale-95 active:opacity-60
                 transition-all duration-150"
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-1 mb-3">
        <span className="text-sm font-bold text-white leading-tight">{fighter.name}</span>
        <span className="text-gray-700 text-base mt-0.5 group-hover:text-yellow-600 transition-colors">⠿</span>
      </div>

      {/* Stats hidden – only show ability icons so user can't cherry-pick */}
      <div className="flex justify-center gap-2 my-3">
        {ROWS.map(r => (
          <span key={r.key} className="text-base opacity-30 group-hover:opacity-60 transition-opacity">
            {r.icon}
          </span>
        ))}
      </div>

      <div className="text-center text-[9px] text-gray-700 tracking-widest group-hover:text-yellow-700 transition-colors">
        DRAG TO SLOT
      </div>
    </div>
  );
}
