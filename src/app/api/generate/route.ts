import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Fighter, Era, WeightClass, GoatStats, GenerateResult, RankingEntry } from '@/types';

const ERAS: Era[] = ['1-100', '101-200', '201-300', '300至今'];

const WEIGHT_CLASSES: WeightClass[] = [
  'flyweight', 'bantamweight', 'featherweight', 'lightweight',
  'welterweight', 'middleweight', 'light_heavyweight', 'heavyweight',
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

const GOAT_NAMES: Record<string, string[]> = {
  striking:   ['The Destroyer',  'Iron Fist',       'The Executioner'],
  wrestling:  ['The Dominator',  'The Crusher',     'Iron Wall'],
  bjj:        ['The Wizard',     'The Serpent',     'Submission King'],
  fightIQ:    ['The Professor',  'The Chess Master','The Maestro'],
  durability: ['The Machine',    'Iron Will',       'The Tank'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFighterPool(fighters: Fighter[], era: Era, weight: WeightClass): Fighter[] {
  let pool = fighters.filter(f => f.era === era && f.weight === weight);
  if (pool.length >= 2) return pool;

  // Expand to adjacent eras until we have at least 2 fighters
  const eraIdx = ERAS.indexOf(era);
  for (let offset = 1; offset <= ERAS.length && pool.length < 2; offset++) {
    if (eraIdx - offset >= 0)
      pool = [...pool, ...fighters.filter(f => f.era === ERAS[eraIdx - offset] && f.weight === weight)];
    if (eraIdx + offset < ERAS.length)
      pool = [...pool, ...fighters.filter(f => f.era === ERAS[eraIdx + offset] && f.weight === weight)];
  }

  // Last resort: all fighters of that weight class
  if (pool.length < 2) pool = fighters.filter(f => f.weight === weight);
  if (pool.length < 2) pool = fighters;

  return pool;
}

export async function GET() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'fighters.json'), 'utf-8');
    const fighters: Fighter[] = JSON.parse(raw);

    const era = pick(ERAS);
    const weightClass = pick(WEIGHT_CLASSES);
    const pool = getFighterPool(fighters, era, weightClass);

    // Each stat drawn from a separately-picked fighter
    const f1 = pick(pool), f2 = pick(pool), f3 = pick(pool), f4 = pick(pool), f5 = pick(pool);
    const stats: GoatStats = {
      striking:   { value: f1.striking,   source: f1.name },
      wrestling:  { value: f2.wrestling,  source: f2.name },
      bjj:        { value: f3.bjj,        source: f3.name },
      fightIQ:    { value: f4.fightIQ,    source: f4.name },
      durability: { value: f5.durability, source: f5.name },
    };

    const ovr = Math.round(
      stats.striking.value   * 0.25 +
      stats.wrestling.value  * 0.25 +
      stats.bjj.value        * 0.20 +
      stats.fightIQ.value    * 0.20 +
      stats.durability.value * 0.10
    );

    // Name based on dominant stat
    const topStat = (Object.keys(stats) as (keyof GoatStats)[])
      .reduce((a, b) => stats[a].value >= stats[b].value ? a : b);
    const goatName = pick(GOAT_NAMES[topStat]);

    const ranking: RankingEntry[] = [
      ...LEGENDS,
      { name: goatName, ovr, isGenerated: true },
    ].sort((a, b) => b.ovr - a.ovr);

    const goatRank = ranking.findIndex(e => e.isGenerated) + 1;

    const result: GenerateResult = {
      era, weightClass, stats, ovr, goatName,
      ranking, goatRank,
      fighterPool: pool.map(f => f.name),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate GOAT' }, { status: 500 });
  }
}
