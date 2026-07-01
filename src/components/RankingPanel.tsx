import type { RankingEntry } from '@/types';

interface Props {
  ranking: RankingEntry[];
  goatRank: number;
}

function rankColor(i: number, isGenerated?: boolean) {
  if (isGenerated) return 'text-yellow-400';
  if (i === 0) return 'text-yellow-400';
  if (i === 1) return 'text-gray-300';
  if (i === 2) return 'text-amber-600';
  return 'text-gray-600';
}

function rankMedal(rank: number) {
  if (rank === -1) return '综合评分不足，未进入传奇榜';
  if (rank >= 10)  return '距离传奇还有差距，继续努力';
  if (rank === 1)  return '史上第一！无可撼动的 GOAT！';
  if (rank === 2)  return '仅次于传说，几乎完美';
  if (rank === 3)  return '跻身三甲，实力顶尖';
  if (rank <= 5)   return '历史前五，传奇级别';
  return '具备历史竞争力';
}

function rankLabel(rank: number) {
  if (rank === -1) return '未上榜';
  if (rank >= 10)  return '榜外';
  return `第 ${rank} 位`;
}

function rankLabelColor(rank: number) {
  if (rank === -1 || rank >= 10) return 'text-gray-500';
  if (rank === 1)  return 'text-yellow-300';
  if (rank <= 3)   return 'text-yellow-400';
  return 'text-yellow-400';
}

export default function RankingPanel({ ranking, goatRank }: Props) {
  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2a2a3a] p-5">
        <div className="text-[10px] tracking-[0.2em] text-gray-500 font-bold mb-0.5">
          HALL OF LEGENDS
        </div>
        <h3 className="text-base font-black text-white">传奇排名榜</h3>
        <p className="text-[11px] text-gray-600 mt-1">与历史最强选手的综合排名对比</p>
      </div>

      {/* List */}
      <div className="p-4 space-y-2 flex-1">
        {ranking.map((fighter, i) => (
          <div
            key={fighter.name + i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              fighter.isGenerated
                ? 'bg-yellow-400/10 border border-yellow-400/35 shadow-[0_0_16px_rgba(255,215,0,0.08)]'
                : 'bg-[#0a0a10] border border-transparent'
            }`}
          >
            <span className={`w-7 text-center font-black text-base tabular-nums ${rankColor(i, fighter.isGenerated)}`}>
              #{i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold truncate ${fighter.isGenerated ? 'text-yellow-300' : 'text-white'}`}>
                {fighter.isGenerated && <span className="mr-1">⚡</span>}
                {fighter.name}
              </div>
              {fighter.isGenerated && (
                <div className="text-[10px] text-yellow-500/60 tracking-wide">← 你生成的选手</div>
              )}
            </div>

            <span className={`text-lg font-black tabular-nums ${
              fighter.isGenerated ? 'text-yellow-400' : i === 0 ? 'text-yellow-400' : 'text-gray-500'
            }`}>
              {fighter.ovr}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 pt-0">
        <div className={`rounded-xl p-4 text-center border ${
          goatRank === -1 || goatRank >= 10
            ? 'bg-white/3 border-white/10'
            : 'bg-yellow-400/8 border-yellow-400/20'
        }`}>
          <div className="text-[10px] text-gray-500 tracking-[0.2em] font-bold mb-1">
            YOUR RANK
          </div>
          <div className={`text-4xl font-black leading-none ${rankLabelColor(goatRank)}`}>
            {rankLabel(goatRank)}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">{rankMedal(goatRank)}</div>
        </div>
      </div>
    </div>
  );
}
