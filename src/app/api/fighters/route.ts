import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Fighter, Era, WeightClass } from '@/types';

const ERAS: Era[] = ['1-100', '101-200', '201-300', '300至今'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const era = searchParams.get('era') as Era | null;
  const weight = searchParams.get('weight') as WeightClass | null;

  const fighters: Fighter[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'fighters.json'), 'utf-8')
  );

  if (!era || !weight) return NextResponse.json([]);

  let pool = fighters.filter(f => f.era === era && f.weight === weight);

  // Expand to adjacent eras if fewer than 3 fighters
  if (pool.length < 3) {
    const idx = ERAS.indexOf(era);
    for (let off = 1; off <= ERAS.length && pool.length < 3; off++) {
      if (idx - off >= 0)
        pool = [...pool, ...fighters.filter(f => f.era === ERAS[idx - off] && f.weight === weight)];
      if (idx + off < ERAS.length)
        pool = [...pool, ...fighters.filter(f => f.era === ERAS[idx + off] && f.weight === weight)];
    }
  }

  if (pool.length === 0) pool = fighters.filter(f => f.weight === weight);
  if (pool.length === 0) pool = fighters.slice(0, 8);

  return NextResponse.json(pool);
}
