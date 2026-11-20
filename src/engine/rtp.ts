import { CaseDef, Prices, SELL_RATE, SKINS, casePrice, tierWeights } from './game';
import { priceRange } from './extra';
import { T } from '../theme';

// Tahmini geri dönüş (RTP): beklenen eşya değeri x satış oranı / (kasa + anahtar)
export type Rtp = { ev: number; cost: number; pct: number };
const cache = new Map<string, { pr: Prices; v: Rtp }>();

export function caseRtp(c: CaseDef, prices: Prices): Rtp {
  const hit = cache.get(c.id);
  if (hit && hit.pr === prices) return hit.v;
  const w = tierWeights(c);
  const mid = (sid: string) => { const r = priceRange(sid, prices); return (r.lo + r.hi) / 2; };
  let ev = 0;
  for (let t = 1; t <= 5; t++) {
    const ids = t === 5 ? c.rare : c.items.filter((s) => SKINS[s].t === t);
    if (!ids.length || !w[t]) continue;
    ev += w[t] * (ids.reduce((a, s) => a + mid(s), 0) / ids.length);
  }
  const cost = casePrice(c, prices);
  const v = { ev, cost, pct: (ev * SELL_RATE) / cost };
  cache.set(c.id, { pr: prices, v });
  return v;
}
export const rtpColor = (pct: number) => (pct >= 0.6 ? T.green : pct >= 0.4 ? T.gold : T.red);
export const rtpSym = (pct: number) => (pct >= 0.6 ? '▲' : pct >= 0.4 ? '■' : '▼');
