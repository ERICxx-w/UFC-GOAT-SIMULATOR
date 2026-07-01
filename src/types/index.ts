export type Era = '1-100' | '101-200' | '201-300' | '300至今';

export type StatField = 'striking' | 'wrestling' | 'bjj' | 'fightIQ' | 'durability';

export type WeightClass =
  | 'flyweight'
  | 'bantamweight'
  | 'featherweight'
  | 'lightweight'
  | 'welterweight'
  | 'middleweight'
  | 'light_heavyweight'
  | 'heavyweight';

export interface Fighter {
  name: string;
  era: Era;
  weight: WeightClass;
  striking: number;
  wrestling: number;
  bjj: number;
  fightIQ: number;
  durability: number;
}

export interface StatEntry {
  value: number;
  source: string;
}

export interface GoatStats {
  striking: StatEntry;
  wrestling: StatEntry;
  bjj: StatEntry;
  fightIQ: StatEntry;
  durability: StatEntry;
}

export interface RankingEntry {
  name: string;
  ovr: number;
  isGenerated?: boolean;
}

export interface GenerateResult {
  era: Era;
  weightClass: WeightClass;
  stats: GoatStats;
  ovr: number;
  goatName: string;
  ranking: RankingEntry[];
  goatRank: number;
  fighterPool: string[];
}
