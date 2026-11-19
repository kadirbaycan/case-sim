import { CASES, SKINS, WEARS, basePrice, Prices, tierWeights, CaseDef } from './game';

// ---------- Fiyat aralığı (kasa içeriği kartları) ----------
const rangeCache = new Map<string, [number, number, boolean]>();
let cacheStamp: Prices | null = null;

export function priceRange(skinId: string, prices: Prices): { lo: number; hi: number; est: boolean } {
  if (cacheStamp !== prices) { rangeCache.clear(); cacheStamp = prices; }
  let r = rangeCache.get(skinId);
  if (!r) {
    const s = SKINS[skinId];
    let lo = Infinity, hi = 0, est = true;
    for (let w = 0; w < 5; w++) {
      if (s.v && w > 0) break;
      const wlo = w === 0 ? 0 : WEARS[w - 1].max;
      const a = Math.max(wlo, s.min), b = Math.min(WEARS[w].max, s.max);
      if (!s.v && a >= b) continue;
      const p = basePrice(s, s.v ? 0 : (a + b) / 2, false, prices);
      if (!p.est) est = false;
      lo = Math.min(lo, p.p); hi = Math.max(hi, p.p);
    }
    if (!isFinite(lo)) { lo = 0; hi = 0; }
    r = [lo, hi, est];
    rangeCache.set(skinId, r);
  }
  return { lo: r[0], hi: r[1], est: r[2] };
}

export const fmtP = (n: number) => (n >= 1000 ? '$' + Math.round(n).toLocaleString('en-US') : n >= 100 ? '$' + Math.round(n) : n >= 10 ? '$' + n.toFixed(1).replace(/\.0$/, '') : '$' + n.toFixed(2));
export const fmtRange = (r: { lo: number; hi: number }) => (Math.abs(r.hi - r.lo) < r.lo * 0.15 || r.hi === 0 ? fmtP(r.hi || r.lo) : `${fmtP(r.lo)} - ${fmtP(r.hi)}`);

// Kasa içindeki eşya başına düşme yüzdesi
export function dropPercent(c: CaseDef, skinId: string): number {
  const w = tierWeights(c);
  const t = SKINS[skinId].t;
  if (t === 5) {
    const names = new Set(c.rare.map((id) => SKINS[id].n));
    return (w[5] * 100) / names.size;
  }
  const n = c.items.filter((id) => SKINS[id].t === t).length;
  return (w[t] * 100) / n;
}

// ---------- Günlük görevler ----------
export type MissionType = 'open' | 'sell' | 'upgrade' | 'trade' | 'tap' | 'covert' | 'spend';
export type Mission = { id: string; type: MissionType; target: number; progress: number; stars: number; cash: number; claimed: boolean };

const POOL: { type: MissionType; name: (n: number) => string; opts: number[]; stars: number[]; cash: number[] }[] = [
  { type: 'open', name: (n) => `${n} kasa aç`, opts: [10, 20, 30], stars: [10, 15, 20], cash: [0.5, 1, 2] },
  { type: 'sell', name: (n) => `${n} eşya sat`, opts: [5, 10, 20], stars: [10, 15, 20], cash: [0.5, 1, 1.5] },
  { type: 'spend', name: (n) => `Kasalara $${n} harca`, opts: [10, 25, 50], stars: [10, 15, 25], cash: [0.5, 1.5, 3] },
  { type: 'upgrade', name: (n) => `Upgrader'ı ${n} kez dene`, opts: [1, 2, 3], stars: [10, 15, 20], cash: [1, 2, 3] },
  { type: 'trade', name: (n) => `${n} takas kontratı yap`, opts: [1, 2], stars: [15, 25], cash: [1.5, 3] },
  { type: 'tap', name: (n) => `${n} kez tıkla`, opts: [100, 250, 500], stars: [10, 15, 20], cash: [0.5, 1, 2] },
  { type: 'covert', name: (n) => `${n} Covert veya üstü çıkar`, opts: [1], stars: [25], cash: [3] },
];
export const missionName = (m: Mission) => POOL.find((p) => p.type === m.type)!.name(m.target);
export const MISSION_ICON: Record<MissionType, string> = { open: '📦', sell: '💰', spend: '💸', upgrade: '⚡', trade: '🔁', tap: '👆', covert: '🔥' };

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

export function makeMissions(day: string): Mission[] {
  const rnd = seeded('m' + day);
  const rest = POOL.filter((p) => p.type !== 'open');
  const picks = [POOL[0]];
  while (picks.length < 4) {
    const p = rest.splice(Math.floor(rnd() * rest.length), 1)[0];
    picks.push(p);
  }
  return picks.map((p) => {
    const i = Math.floor(rnd() * p.opts.length);
    return { id: `${day}-${p.type}`, type: p.type, target: p.opts[i], progress: 0, stars: p.stars[i], cash: p.cash[i], claimed: false };
  });
}

// ---------- Sezon ----------
export const SEASON_TIERS = 50;
export const STARS_PER_TIER = 5;
export const SEASON_DAYS = 30;
export type Reward = { kind: 'cash'; amount: number } | { kind: 'case'; caseId: string; n: number } | { kind: 'skin'; skinId: string };

const SPECIAL_SKINS = Object.entries(SKINS).filter(([, s]) => s.t === 4 && !s.v).map(([id]) => id);

export function seasonReward(tier: number): Reward {
  if (tier % 10 === 0) return { kind: 'skin', skinId: SPECIAL_SKINS[(tier * 7) % SPECIAL_SKINS.length] };
  if (tier % 5 === 0) return { kind: 'case', caseId: CASES[(tier / 5 + 3) % CASES.length].id, n: 3 };
  return { kind: 'cash', amount: Math.round((0.5 + tier * 0.12) * 100) / 100 };
}

// ---------- Çark ----------
export type Prize = { label: string; weight: number; cash?: number; freeCase?: number; color: string };
export const WHEEL: Prize[] = [
  { label: '$0.50', weight: 30, cash: 0.5, color: '#3b4a63' },
  { label: '$1', weight: 25, cash: 1, color: '#3f5f45' },
  { label: '$2', weight: 18, cash: 2, color: '#3b4a63' },
  { label: '$5', weight: 12, cash: 5, color: '#3f5f45' },
  { label: '3 Kasa', weight: 8, freeCase: 3, color: '#6b4fa0' },
  { label: '$10', weight: 4, cash: 10, color: '#8a5a2b' },
  { label: '$25', weight: 2, cash: 25, color: '#b4452f' },
  { label: '$100', weight: 0.8, cash: 100, color: '#c2332f' },
  { label: '$500', weight: 0.2, cash: 500, color: '#c9a227' },
];

export const SUPPLY_MS = 2 * 3600 * 1000;
export const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}s ${m}dk` : `${m}dk ${String(sec).padStart(2, '0')}sn`;
};
