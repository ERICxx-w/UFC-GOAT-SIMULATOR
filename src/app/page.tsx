'use client';

import { useState } from 'react';
import type { Era, WeightClass, Fighter, StatField, GoatStats, GenerateResult, RankingEntry } from '@/types';
import FighterCard from '@/components/FighterCard';
import AbilitySlot from '@/components/AbilitySlot';
import GoatCard from '@/components/GoatCard';
import RankingPanel from '@/components/RankingPanel';

// ── Constants ────────────────────────────────────────────────────────────────

const ERAS: Era[] = ['1-100', '101-200', '201-300', '300至今'];
const WEIGHT_CLASSES: WeightClass[] = [
  'flyweight', 'bantamweight', 'featherweight', 'lightweight',
  'welterweight', 'middleweight', 'light_heavyweight', 'heavyweight',
];
// 1-100时代只有5个量级，没有蝇/雏/羽量级
const EARLY_WEIGHTS: WeightClass[] = [
  'lightweight', 'welterweight', 'middleweight', 'light_heavyweight', 'heavyweight',
];
const ERA_LABELS: Record<Era, string> = {
  '1-100':   '早期格斗时代',
  '101-200': '技术成型时代',
  '201-300': '黄金综合时代',
  '300至今': '现代极限时代',
};
const WEIGHT_LABELS: Record<WeightClass, string> = {
  flyweight:         '蝇量级 Flyweight',
  bantamweight:      '雏量级 Bantamweight',
  featherweight:     '羽量级 Featherweight',
  lightweight:       '轻量级 Lightweight',
  welterweight:      '次中量级 Welterweight',
  middleweight:      '中量级 Middleweight',
  light_heavyweight: '轻重量级 Light Heavyweight',
  heavyweight:       '重量级 Heavyweight',
};
const SLOT_METAS: { key: StatField; label: string; labelEn: string; icon: string }[] = [
  { key: 'striking',   label: '站立打击', labelEn: 'STRIKING',   icon: '👊' },
  { key: 'wrestling',  label: '摔    跤', labelEn: 'WRESTLING',  icon: '🤼' },
  { key: 'bjj',        label: '柔    术', labelEn: 'BJJ',        icon: '🥋' },
  { key: 'fightIQ',    label: '战术智商', labelEn: 'FIGHT IQ',   icon: '🧠' },
  { key: 'durability', label: '扛打能力', labelEn: 'DURABILITY', icon: '🛡️' },
];
const LEGENDS: RankingEntry[] = [
  { name: '乔恩·琼斯',             ovr: 98 },
  { name: '哈比布·努尔马戈梅多夫', ovr: 97 },
  { name: '乔治·圣皮埃尔',         ovr: 96 },
  { name: '安德森·席尔瓦',         ovr: 95 },
  { name: '斯蒂佩·米欧奇',         ovr: 90 },
  { name: '伊斯瑞尔·阿迪萨亚',     ovr: 88 },
  { name: '弗朗西斯·纳干诺',       ovr: 86 },
];
const GOAT_NAMES: Record<StatField, string[]> = {
  striking:   ['The Destroyer', 'Iron Fist',       'The Executioner'],
  wrestling:  ['The Dominator', 'The Crusher',     'Iron Wall'],
  bjj:        ['The Wizard',    'The Serpent',     'Submission King'],
  fightIQ:    ['The Professor', 'The Chess Master','The Maestro'],
  durability: ['The Machine',   'Iron Will',       'The Tank'],
};
const SCHEDULE = [50, 55, 65, 75, 88, 105, 125, 150, 185, 225, 275, 340, 420, 520];

// ── Helpers ──────────────────────────────────────────────────────────────────

type Slots = Partial<Record<StatField, Fighter>>;
type FilledSlots = Record<StatField, Fighter>;

function isFull(s: Slots): s is FilledSlots {
  return SLOT_METAS.every(m => s[m.key] != null);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
// 1-100:15%  101-200:25%  201-300:30%  300至今:30%
const ERA_WEIGHTS = [0.15, 0.25, 0.30, 0.30];
function pickEra(): Era {
  let r = Math.random();
  for (let i = 0; i < ERAS.length; i++) {
    r -= ERA_WEIGHTS[i];
    if (r <= 0) return ERAS[i];
  }
  return ERAS[ERAS.length - 1];
}

// ── Local fighter data ────────────────────────────────────────────────────────
import ALL_FIGHTERS from '../../data/fighters.json';

function getPool(era: Era, weight: WeightClass): Fighter[] {
  const all = ALL_FIGHTERS as Fighter[];
  let pool = all.filter(f => f.era === era && f.weight === weight);
  if (pool.length < 3) {
    const idx = ERAS.indexOf(era);
    for (let off = 1; off <= ERAS.length && pool.length < 3; off++) {
      if (idx - off >= 0)
        pool = [...pool, ...all.filter(f => f.era === ERAS[idx - off] && f.weight === weight)];
      if (idx + off < ERAS.length)
        pool = [...pool, ...all.filter(f => f.era === ERAS[idx + off] && f.weight === weight)];
    }
  }
  if (pool.length === 0) pool = all.filter(f => f.weight === weight);
  if (pool.length === 0) pool = all.slice(0, 8);
  return pool;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // Core game
  const [slots,           setSlots]           = useState<Slots>({});
  const [lockedSlots,     setLockedSlots]     = useState<Set<StatField>>(new Set());
  const [result,          setResult]          = useState<GenerateResult | null>(null);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);

  // Round flow
  const [resetting, setResetting] = useState(false);
  const [lastPick,  setLastPick]  = useState<{ name: string; slot: string } | null>(null);

  // Re-roll budgets (1 each per game)
  const [eraRerollsLeft,    setEraRerollsLeft]    = useState(1);
  const [weightRerollsLeft, setWeightRerollsLeft] = useState(1);

  // Era animation
  const [era,        setEra]        = useState<Era | null>(null);
  const [eraDisplay, setEraDisplay] = useState<Era | null>(null);
  const [eraFlash,   setEraFlash]   = useState(0);
  const [eraRolling, setEraRolling] = useState(false);
  const [eraLocked,  setEraLocked]  = useState(false);

  // Weight animation
  const [weight,   setWeight]   = useState<WeightClass | null>(null);
  const [wDisplay, setWDisplay] = useState<WeightClass | null>(null);
  const [wFlash,   setWFlash]   = useState(0);
  const [wRolling, setWRolling] = useState(false);
  const [wLocked,  setWLocked]  = useState(false);

  // Fighter pool
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading,  setLoading]  = useState(false);

  // Saved for result display (era/weight of last pick)
  const [resultEra,    setResultEra]    = useState<Era>('1-100');
  const [resultWeight, setResultWeight] = useState<WeightClass>('lightweight');

  // ── Roll ERA ────────────────────────────────────────────────────────────
  // KEY RULE: re-rolling era does NOT reset weight.
  // If weight is already set, automatically re-fetch pool with new era + same weight.
  const rollEra = (isReroll = false) => {
    if (eraRolling || wRolling || resetting) return;
    if (isReroll) setEraRerollsLeft(n => n - 1);

    const finalEra   = pickEra();
    const keepWeight = weight; // capture current weight – stays unchanged
    setEraRolling(true);
    setEraLocked(false);
    setFighters([]);

    let step = 0;
    const tick = async () => {
      const isLast = step >= SCHEDULE.length - 1;
      setEraDisplay(isLast ? finalEra : pick(ERAS));
      setEraFlash(n => n + 1);

      if (isLast) {
        setEra(finalEra);
        setEraRolling(false);
        setEraLocked(true);
        setTimeout(() => setEraLocked(false), 600);

        // If weight was already set → load pool with new era + same weight
        if (keepWeight) {
          setFighters(getPool(finalEra, keepWeight));
        }
      } else {
        setTimeout(tick, SCHEDULE[++step]);
      }
    };
    setTimeout(tick, SCHEDULE[0]);
  };

  // ── Roll WEIGHT ─────────────────────────────────────────────────────────
  // KEY RULE: re-rolling weight does NOT reset era.
  // Always re-fetch pool with existing era + new weight.
  const rollWeight = (isReroll = false) => {
    if (wRolling || eraRolling || !era || resetting) return;
    if (isReroll) setWeightRerollsLeft(n => n - 1);

    const weightPool  = era === '1-100' ? EARLY_WEIGHTS : WEIGHT_CLASSES;
    const finalWeight = pick(weightPool);
    const keepEra     = era; // capture current era – stays unchanged
    setWRolling(true);
    setWLocked(false);
    setFighters([]);

    let step = 0;
    const tick = async () => {
      const isLast = step >= SCHEDULE.length - 1;
      setWDisplay(isLast ? finalWeight : pick(WEIGHT_CLASSES));
      setWFlash(n => n + 1);

      if (isLast) {
        setWeight(finalWeight);
        setWRolling(false);
        setWLocked(true);
        setTimeout(() => setWLocked(false), 600);
        setFighters(getPool(keepEra, finalWeight));
      } else {
        setTimeout(tick, SCHEDULE[++step]);
      }
    };
    setTimeout(tick, SCHEDULE[0]);
  };

  // ── Assign fighter (one per round) ───────────────────────────────────────
  const assignSlot = (key: StatField, f: Fighter) => {
    if (resetting || lockedSlots.has(key) || !era || !weight) return;

    const newSlots  = { ...slots, [key]: f };
    const newLocked = new Set(Array.from(lockedSlots).concat(key));
    const allFilled = SLOT_METAS.every(m => newSlots[m.key] != null);

    setSlots(newSlots);
    setLockedSlots(newLocked);
    setSelectedFighter(null);
    setLastPick({ name: f.name, slot: SLOT_METAS.find(m => m.key === key)!.label });
    setResultEra(era);
    setResultWeight(weight);

    if (!allFilled) {
      setResetting(true);
      setTimeout(() => {
        // Reset both era and weight for the next fresh round
        setEra(null);    setEraDisplay(null);
        setWeight(null); setWDisplay(null);
        setFighters([]);
        setResetting(false);
        setLastPick(null);
      }, 1500);
    }
  };

  // ── Generate GOAT ────────────────────────────────────────────────────────
  const generate = () => {
    if (!isFull(slots)) return;
    const stats: GoatStats = {
      striking:   { value: slots.striking.striking,     source: slots.striking.name },
      wrestling:  { value: slots.wrestling.wrestling,   source: slots.wrestling.name },
      bjj:        { value: slots.bjj.bjj,               source: slots.bjj.name },
      fightIQ:    { value: slots.fightIQ.fightIQ,       source: slots.fightIQ.name },
      durability: { value: slots.durability.durability, source: slots.durability.name },
    };
    const ovr = Math.round(
      stats.striking.value * 0.25 + stats.wrestling.value * 0.25 +
      stats.bjj.value * 0.20 + stats.fightIQ.value * 0.20 + stats.durability.value * 0.10
    );
    const topStat = SLOT_METAS.map(m => m.key)
      .reduce((a, b) => stats[a].value >= stats[b].value ? a : b);
    const goatName = pick(GOAT_NAMES[topStat]);
    const inList   = ovr >= 80;   // appears in visible ranking list
    const onBoard  = ovr >= 75;   // any rank status at all
    const ranking: RankingEntry[] = [
      ...LEGENDS,
      ...(inList ? [{ name: goatName, ovr, isGenerated: true }] : []),
    ].sort((a, b) => b.ovr - a.ovr);
    const goatRank = !onBoard ? -1
      : !inList    ? 10
      : ranking.findIndex(e => e.isGenerated) + 1;
    setResult({
      era: resultEra, weightClass: resultWeight,
      stats, ovr, goatName, ranking,
      goatRank,
      fighterPool: fighters.map(f => f.name),
    });
  };

  // ── Reset entire game ────────────────────────────────────────────────────
  const resetGame = () => {
    setResult(null);
    setSlots({}); setLockedSlots(new Set()); setSelectedFighter(null);
    setResetting(false); setLastPick(null);
    setEraRerollsLeft(1); setWeightRerollsLeft(1);
    setEra(null); setEraDisplay(null); setEraFlash(0);
    setWeight(null); setWDisplay(null); setWFlash(0);
    setFighters([]);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const complete   = isFull(slots);
  const roundNum   = lockedSlots.size + 1;
  const slotActive = (key: StatField) =>
    !lockedSlots.has(key) && !resetting && !!era && !!weight;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <header className="border-b border-[#1a1a2a] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-lg font-black tracking-widest text-yellow-400">UFC GOAT SIMULATOR</div>
            <div className="text-[10px] tracking-[0.25em] text-gray-600">跨时代最强选手生成器</div>
          </div>
          {result && (
            <button onClick={resetGame} className="text-xs text-gray-500 hover:text-white transition-colors">
              ← 重新拼装
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── RESULT ────────────────────────────────────────────────── */}
        {result && (
          <div className="anim-slide-up">
            <div className="text-center mb-8">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-bold">
                  各时代精华
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs">
                  5轮拼装完成
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <GoatCard result={result} weightLabel="跨时代组装" />
              <RankingPanel ranking={result.ranking} goatRank={result.goatRank} />
            </div>
            <div className="mt-8 text-center">
              <button onClick={resetGame}
                className="px-8 py-3 border border-yellow-400/40 text-yellow-400 font-bold
                           rounded-xl hover:bg-yellow-400/10 transition-all text-sm tracking-widest">
                ↺ 重新拼装
              </button>
            </div>
          </div>
        )}

        {/* ── GAME ──────────────────────────────────────────────────── */}
        {!result && (
          <>
            {/* Progress bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] tracking-widest text-gray-600">
                  进度 {lockedSlots.size}/5
                </span>
                <span className="text-[10px] text-gray-600">
                  {complete ? '全部完成！' : `第 ${roundNum} 轮`}
                </span>
              </div>
              <div className="h-1.5 bg-[#1a1a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(lockedSlots.size / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Pick confirmation banner */}
            {resetting && lastPick && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-500/8 border border-green-500/30
                              rounded-2xl text-center anim-fade-in">
                <div className="text-green-400 font-black text-base">🔒 {lastPick.name} 已锁定</div>
                <div className="text-gray-500 text-xs mt-1">
                  {lastPick.slot} 能力已确定 · 正在准备第 {lockedSlots.size + 1} 轮…
                </div>
              </div>
            )}

            {/* Step buttons – hidden during resetting and when complete */}
            {!resetting && !complete && (
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">

                {/* ── Era card ── */}
                <div className={`rounded-2xl border p-4 transition-all duration-200 ${
                  eraRolling
                    ? 'border-yellow-400/60 bg-yellow-400/5 rolling-glow'
                    : era ? 'border-yellow-400/30 bg-yellow-400/5'
                          : 'border-[#2a2a3a] bg-[#0e0e18]'
                }`}>
                  <div className="text-[10px] tracking-[0.2em] text-gray-600 font-bold mb-2">
                    STEP 01 · 年代
                  </div>

                  {/* Rolling */}
                  {eraRolling && (
                    <div>
                      <div className="text-[9px] text-yellow-500/70 tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping inline-block" />
                        正在抽取…
                      </div>
                      <div className="overflow-hidden h-7">
                        <div key={eraFlash} className="slot-up text-base font-black text-yellow-300">
                          {eraDisplay}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settled */}
                  {!eraRolling && era && (
                    <>
                      <div className={`text-base font-black text-yellow-400 mb-0.5 ${eraLocked ? 'lock-in' : ''}`}>
                        {era}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">{ERA_LABELS[era]}</div>
                      {eraRerollsLeft > 0 ? (
                        <button
                          onClick={() => rollEra(true)}
                          className="text-[11px] text-yellow-700 hover:text-yellow-400 transition-colors"
                        >
                          ↺ 重转年代（剩 {eraRerollsLeft} 次）
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-700 line-through">重转已用尽</span>
                      )}
                    </>
                  )}

                  {/* Initial */}
                  {!eraRolling && !era && (
                    <>
                      <div className="text-xs text-gray-600 mb-3">点击随机抽取年代</div>
                      <button
                        onClick={() => rollEra(false)}
                        className="w-full py-2.5 bg-yellow-400 text-black font-black text-sm
                                   rounded-lg hover:bg-yellow-300 active:scale-95
                                   shadow-[0_0_20px_rgba(255,215,0,0.2)]
                                   transition-all tracking-wider"
                      >
                        🎲 随机年代
                      </button>
                    </>
                  )}
                </div>

                {/* ── Weight card ── */}
                <div className={`rounded-2xl border p-4 transition-all duration-200 ${
                  wRolling
                    ? 'border-yellow-400/60 bg-yellow-400/5 rolling-glow'
                    : weight ? 'border-yellow-400/30 bg-yellow-400/5'
                             : era ? 'border-[#2a2a3a] bg-[#0e0e18]'
                                   : 'border-[#1a1a22] bg-[#090910] opacity-40'
                }`}>
                  <div className="text-[10px] tracking-[0.2em] text-gray-600 font-bold mb-2">
                    STEP 02 · 量级
                  </div>

                  {/* Rolling */}
                  {wRolling && (
                    <div>
                      <div className="text-[9px] text-yellow-500/70 tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping inline-block" />
                        正在抽取…
                      </div>
                      <div className="overflow-hidden h-7">
                        <div key={wFlash} className="slot-up text-base font-black text-yellow-300 truncate">
                          {wDisplay ? WEIGHT_LABELS[wDisplay].split(' ')[1] : '???'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settled */}
                  {!wRolling && weight && (
                    <>
                      <div className={`text-base font-black text-yellow-400 mb-0.5 ${wLocked ? 'lock-in' : ''}`}>
                        {WEIGHT_LABELS[weight].split(' ')[1]}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">{WEIGHT_LABELS[weight]}</div>
                      {weightRerollsLeft > 0 ? (
                        <button
                          onClick={() => rollWeight(true)}
                          disabled={!era}
                          className="text-[11px] text-yellow-700 hover:text-yellow-400 transition-colors disabled:opacity-30"
                        >
                          ↺ 重转量级（剩 {weightRerollsLeft} 次）
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-700 line-through">重转已用尽</span>
                      )}
                    </>
                  )}

                  {/* Initial */}
                  {!wRolling && !weight && (
                    <>
                      <div className="text-xs text-gray-600 mb-3">
                        {era ? '年代已选，点击抽取量级' : '请先选择年代'}
                      </div>
                      <button
                        onClick={() => rollWeight(false)}
                        disabled={!era}
                        className="w-full py-2.5 bg-yellow-400 text-black font-black text-sm
                                   rounded-lg hover:bg-yellow-300 active:scale-95
                                   shadow-[0_0_20px_rgba(255,215,0,0.2)]
                                   transition-all tracking-wider
                                   disabled:bg-[#252530] disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                      >
                        🎲 随机量级
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Assembly area ── */}
            <div>
              {(era && weight && !resetting) && (
                <div className="flex items-center gap-3 mb-6 text-xs text-gray-600">
                  <div className="flex-1 h-px bg-[#1e1e2e]" />
                  <span>
                    {loading
                      ? '正在加载选手…'
                      : fighters.length > 0
                        ? `${fighters.length} 名选手可选 · 本轮只能选 1 名`
                        : '该时代量级暂无数据，请尝试重转'}
                  </span>
                  <div className="flex-1 h-px bg-[#1e1e2e]" />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

                {/* Left: Ability Slots */}
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] tracking-[0.2em] text-gray-600 font-bold mb-1">
                    GOAT 能力配置
                  </div>

                  {SLOT_METAS.map(m => (
                    <AbilitySlot
                      key={m.key}
                      statField={m.key}
                      label={m.label}
                      labelEn={m.labelEn}
                      icon={m.icon}
                      fighter={slots[m.key] ?? null}
                      locked={lockedSlots.has(m.key)}
                      active={slotActive(m.key)}
                      onAssign={(f) => assignSlot(m.key, f)}
                      tapFighter={selectedFighter}
                    />
                  ))}

                  {complete && (
                    <button
                      onClick={generate}
                      className="w-full py-4 mt-2 rounded-xl font-black tracking-widest text-sm
                                 bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-[1.02]
                                 active:scale-95 shadow-[0_0_30px_rgba(255,215,0,0.4)]
                                 transition-all duration-200 anim-slide-up"
                    >
                      ⚡ 5轮完成！生成 GOAT！
                    </button>
                  )}
                </div>

                {/* Right: Fighter pool */}
                <div>
                  {era && weight ? (
                    <>
                      <div className="text-[10px] tracking-[0.2em] text-gray-600 font-bold mb-3">
                        选手池 · 拖拽到左侧能力槽
                      </div>
                      {loading ? (
                        <div className="flex justify-center items-center h-48">
                          <div className="spinner" />
                        </div>
                      ) : fighters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                          <div className="text-3xl">😅</div>
                          <div className="text-gray-600 text-sm">该组合暂无选手</div>
                          <div className="text-gray-700 text-xs">使用上方重转按钮更换年代或量级</div>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-2 xl:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1
                                         transition-opacity duration-300 ${resetting ? 'opacity-25 pointer-events-none' : ''}`}>
                          {fighters.map(f => (
                            <FighterCard
                              key={`${f.name}|${f.era}`}
                              fighter={f}
                              selected={selectedFighter?.name === f.name && selectedFighter?.era === f.era}
                              onSelect={() => setSelectedFighter(prev =>
                                prev?.name === f.name && prev?.era === f.era ? null : f
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    !resetting && lockedSlots.size > 0 && !complete ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                        <div className="text-4xl">🎲</div>
                        <div className="text-gray-600 text-sm">已锁定 {lockedSlots.size}/5 个能力</div>
                        <div className="text-gray-700 text-xs">随机新年代和量级，继续拼装</div>
                      </div>
                    ) : !resetting && lockedSlots.size === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                        <div className="text-5xl">🥊</div>
                        <div className="text-gray-700 text-sm tracking-wide">共进行 5 轮随机拼装</div>
                        <div className="text-gray-800 text-xs">每轮可选择一名选手拖入能力槽</div>
                        <div className="text-gray-800 text-xs">年代和量级各有 1 次重转机会</div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
