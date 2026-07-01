'use client';

import { useState } from 'react';
import type { Fighter, StatField } from '@/types';

interface Props {
  statField: StatField;
  label: string;
  labelEn: string;
  icon: string;
  fighter: Fighter | null;
  locked: boolean;   // permanently filled – no drag accepted
  active: boolean;   // currently accepting drops this round
  onAssign: (f: Fighter) => void;
}


export default function AbilitySlot({ statField, label, labelEn, icon, fighter, locked, active, onAssign }: Props) {
  const [over, setOver] = useState(false);

  const value = fighter ? fighter[statField] : null;

  // Border / background logic
  let boxClass = '';
  if (locked) {
    boxClass = 'border-yellow-500/50 bg-[#1a1500]';
  } else if (over && active) {
    boxClass = 'border-yellow-400 bg-yellow-400/8 shadow-[0_0_20px_rgba(255,215,0,0.15)] scale-[1.01]';
  } else if (active) {
    boxClass = 'border-dashed border-[#2a2a3a] bg-[#09090f]';
  } else {
    boxClass = 'border-dashed border-[#1a1a22] bg-[#070710] opacity-45';
  }

  return (
    <div
      className={`rounded-xl border-2 px-4 py-3 transition-all duration-150 ${boxClass}`}
      onDragOver={(e) => {
        if (!active || locked) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!active || locked) return;
        try {
          const f: Fighter = JSON.parse(e.dataTransfer.getData('application/json'));
          onAssign(f);
        } catch { /* ignore */ }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <div>
            <div className="text-sm font-bold text-gray-200 leading-tight">{label}</div>
            <div className="text-[9px] text-gray-600 tracking-widest">{labelEn}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {locked && (
            <span className="text-yellow-600 text-base" title="已锁定">🔒</span>
          )}
        </div>
      </div>

      <div className="mt-2 h-6">
        {fighter ? (
          <div className="text-sm font-black text-yellow-300 tracking-wide truncate">
            {fighter.name}
          </div>
        ) : (
          <div className={`text-xs text-center transition-colors ${
            over && active ? 'text-yellow-400' : active ? 'text-gray-700' : 'text-gray-800'
          }`}>
            {over && active ? '↓ 放开分配' : active ? '← 将选手拖入此槽' : '—'}
          </div>
        )}
      </div>
    </div>
  );
}
