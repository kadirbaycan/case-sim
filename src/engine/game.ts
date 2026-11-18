import raw from '../data/game.json';
import { hmacSha256, utf8 } from './sha256';

export type Skin = {
  n: string; t: number; img: string; min: number; max: number;
  st: boolean; v: number; ph: string | null;
};
export type CaseDef = { id: string; name: string; date: string; img: string; items: string[]; rare: string[] };
export type Item = {
  uid: string; skinId: string; float: number; st: boolean;
  seed: number; mult: number; at: number;
};

export const SKINS = raw.skins as unknown as Record<string, Skin>;
export const CASES = raw.cases as unknown as CaseDef[];
export const CASE_BY_ID: Record<string, CaseDef> = Object.fromEntries(CASES.map((c) => [c.id, c]));

export const KEY_PRICE = 2.49;
export const SELL_RATE = 0.9; // pazar komisyonu
export const START_BALANCE = 50;

export const TIER_NAME = ['', 'Mil-Spec', 'Restricted', 'Classified', 'Covert', 'Nadir Özel (★)'];
export const TIER_COLOR = ['#888', '#4b69ff', '#8847ff', '#d32ce6', '#eb4b4b', '#ffd700'];
// Valve'ın resmi oranları
const TIER_WEIGHT: Record<number, number> = { 1: 79.92, 2: 15.98, 3: 3.2, 4: 0.64, 5: 0.26 };

// ---------- Aşınma ----------
export const WEARS = [
  { name: 'Factory New', short: 'FN', max: 0.07 },
  { name: 'Minimal Wear', short: 'MW', max: 0.15 },
  { name: 'Field-Tested', short: 'FT', max: 0.38 },
  { name: 'Well-Worn', short: 'WW', max: 0.45 },
  { name: 'Battle-Scarred', short: 'BS', max: 1.0001 },
];
export const wearIndex = (f: number) => WEARS.findIndex((w) => f < w.max);

// ---------- Adil-oyun RNG ----------
export type Fair = { serverSeed: string; clientSeed: string; nonce: number };

export class Rng {
  private cursor = 0;
  constructor(private f: Fair, private nonce: number) {}
  next(): number {
    const mac = hmacSha256(utf8(this.f.serverSeed), utf8(`${this.f.clientSeed}:${this.nonce}:${this.cursor++}`));
    // ilk 6 bayt = 48 bit -> [0,1)
    let n = 0;
    for (let i = 0; i < 6; i++) n = n * 256 + mac[i];
    return n / 281474976710656;
  }
}

// ---------- Desen / faz çarpanları ----------
const PHASE_W: Record<string, number> = {
  'Phase 1': 24, 'Phase 2': 24, 'Phase 3': 24, 'Phase 4': 24,
  Ruby: 0.8, Sapphire: 0.8, 'Black Pearl': 0.6, Emerald: 0.6,
};
const PHASE_MULT: Record<string, number> = {
  'Phase 1': 0.95, 'Phase 2': 1.1, 'Phase 3': 0.95, 'Phase 4': 1.05,
  Ruby: 6, Sapphire: 8, 'Black Pearl': 3, Emerald: 25,
};
const BLUE_AK: Record<number, number> = { 661: 40, 670: 15, 955: 14, 179: 12, 387: 12, 151: 10, 321: 8, 168: 8, 592: 6, 828: 6 };

export function patternMult(skin: Skin, seed: number): number {
  if (skin.ph && PHASE_MULT[skin.ph]) return PHASE_MULT[skin.ph];
  if (skin.n.includes('Case Hardened')) {
    if (skin.n.startsWith('AK-47') && BLUE_AK[seed]) return BLUE_AK[seed];
    if (seed % 101 === 0) return 1.6; // genel "mavi ağırlıklı" desen primi
  }
  return 1;
}

// ---------- Kasa açma ----------
const rareGroups = new Map<string, string[][]>();
function groupsFor(c: CaseDef): string[][] {
  let g = rareGroups.get(c.id);
  if (!g) {
    const m = new Map<string, string[]>();
    for (const id of c.rare) {
      const k = SKINS[id].n;
      m.set(k, [...(m.get(k) || []), id]);
    }
    g = [...m.values()];
    rareGroups.set(c.id, g);
  }
  return g;
}

export function tierWeights(c: CaseDef): Record<number, number> {
  const present: Record<number, number> = {};
  for (const id of c.items) present[SKINS[id].t] = 1;
  if (c.rare.length) present[5] = 1;
  const total = Object.keys(present).reduce((a, k) => a + TIER_WEIGHT[+k], 0);
  const out: Record<number, number> = {};
  for (const k of Object.keys(present)) out[+k] = TIER_WEIGHT[+k] / total;
  return out;
}

let uidCounter = 0;
const newUid = () => `${Date.now().toString(36)}${(uidCounter++).toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

export function rollCase(c: CaseDef, rng: Rng): Item {
  const w = tierWeights(c);
  let r = rng.next();
  let tier = 1;
  for (const k of Object.keys(w).map(Number).sort((a, b) => a - b)) {
    tier = k;
    if (r < w[k]) break;
    r -= w[k];
  }
  let skinId: string;
  if (tier === 5) {
    const groups = groupsFor(c);
    const grp = groups[Math.floor(rng.next() * groups.length)];
    const weights = grp.map((id) => PHASE_W[SKINS[id].ph || ''] ?? 1);
    let x = rng.next() * weights.reduce((a, b) => a + b, 0);
    skinId = grp[grp.length - 1];
    for (let i = 0; i < grp.length; i++) {
      if (x < weights[i]) { skinId = grp[i]; break; }
      x -= weights[i];
    }
  } else {
    const pool = c.items.filter((id) => SKINS[id].t === tier);
    skinId = pool[Math.floor(rng.next() * pool.length)];
  }
  return makeItem(skinId, rng);
}

export function makeItem(skinId: string, rng: Rng, forcedFloat?: number): Item {
  const s = SKINS[skinId];
  const fr = rng.next();
  const float = s.v ? 0 : forcedFloat ?? s.min + fr * (s.max - s.min);
  const st = s.st && rng.next() < 0.1;
  const seed = Math.floor(rng.next() * 1001);
  return { uid: newUid(), skinId, float, st, seed, mult: patternMult(s, seed), at: Date.now() };
}

// ---------- Piyasa adı & fiyat ----------
export function marketName(s: Skin, wear: number, st: boolean): string {
  let base = s.n;
  if (st) base = base.startsWith('★ ') ? `★ StatTrak™ ${base.slice(2)}` : `StatTrak™ ${base}`;
  return s.v ? base : `${base} (${WEARS[wear].name})`;
}

export type Prices = Record<string, number>;
const TIER_BASE = [0, 0.6, 3, 15, 80, 500];
const WEAR_F = [1.6, 1.25, 1, 0.8, 0.7];

export function basePrice(s: Skin, float: number, st: boolean, prices: Prices): { p: number; est: boolean } {
  const wi = s.v ? 0 : wearIndex(float);
  const hit = prices[marketName(s, wi, st)];
  if (hit && hit > 0) return { p: hit, est: false };
  const alt = prices[marketName(s, wi, false)];
  if (alt && alt > 0) return { p: alt * (st ? 2.2 : 1), est: false };
  return { p: TIER_BASE[s.t] * WEAR_F[wi] * (st ? 2.2 : 1), est: true };
}

export function itemPrice(it: Item, prices: Prices): { p: number; est: boolean } {
  const s = SKINS[it.skinId];
  const b = basePrice(s, it.float, it.st, prices);
  // Aynı aşınma içinde düşük float'a küçük prim
  let bonus = 1;
  if (!s.v) {
    const wi = wearIndex(it.float);
    const lo = wi === 0 ? 0 : WEARS[wi - 1].max;
    const hi = Math.min(WEARS[wi].max, 1);
    const pos = (it.float - lo) / (hi - lo);
    bonus = 1 + (0.5 - pos) * 0.1;
  }
  return { p: b.p * bonus * it.mult, est: b.est };
}

export const itemName = (it: Item) => {
  const s = SKINS[it.skinId];
  return (it.st ? (s.n.startsWith('★ ') ? `★ StatTrak™ ${s.n.slice(2)}` : `StatTrak™ ${s.n}`) : s.n) + (s.ph ? ` (${s.ph})` : '');
};

export function casePrice(c: CaseDef, prices: Prices): number {
  return (prices[c.name] && prices[c.name] > 0 ? prices[c.name] : 0.6) + KEY_PRICE;
}

// ---------- Seviye ----------
export const xpForLevel = (lvl: number) => Math.round(40 * Math.pow(lvl, 1.15));
export function levelFromXp(xp: number): { level: number; cur: number; need: number } {
  let level = 1;
  let rest = xp;
  while (level < 100 && rest >= xpForLevel(level)) { rest -= xpForLevel(level); level++; }
  return { level, cur: rest, need: level >= 100 ? 1 : xpForLevel(level) };
}

// ---------- Upgrader ----------
export const UPGRADE_EDGE = 0.95;
export function upgradeChance(inputValue: number, targetValue: number): number {
  return Math.max(0.005, Math.min(0.95, (inputValue / targetValue) * UPGRADE_EDGE));
}

// ---------- Trade-Up ----------
export type TradeOutcome = { skinId: string; prob: number };
export function tradeOutcomes(inputs: Item[]): TradeOutcome[] {
  if (!inputs.length) return [];
  const tier = SKINS[inputs[0].skinId].t;
  const counts = new Map<string, number>();
  for (const it of inputs) {
    const cs = CASES.find((c) => c.items.includes(it.skinId));
    if (cs) counts.set(cs.id, (counts.get(cs.id) || 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const res = new Map<string, number>();
  for (const [cid, n] of counts) {
    const pool = CASE_BY_ID[cid].items.filter((id) => SKINS[id].t === tier + 1);
    for (const id of pool) res.set(id, (res.get(id) || 0) + n / total / pool.length);
  }
  return [...res.entries()].map(([skinId, prob]) => ({ skinId, prob })).sort((a, b) => b.prob - a.prob);
}

export function tradeFloat(inputs: Item[], out: Skin): number {
  const norm = inputs.map((it) => {
    const s = SKINS[it.skinId];
    return s.max > s.min ? (it.float - s.min) / (s.max - s.min) : 0;
  });
  const avg = norm.reduce((a, b) => a + b, 0) / norm.length;
  return out.min + avg * (out.max - out.min);
}

export function doTrade(inputs: Item[], rng: Rng): Item | null {
  const outs = tradeOutcomes(inputs);
  if (!outs.length) return null;
  let x = rng.next();
  let pick = outs[outs.length - 1].skinId;
  for (const o of outs) { if (x < o.prob) { pick = o.skinId; break; } x -= o.prob; }
  const it = makeItem(pick, rng, tradeFloat(inputs, SKINS[pick]));
  it.st = inputs.every((i) => i.st) && SKINS[pick].st;
  it.mult = patternMult(SKINS[pick], it.seed);
  return it;
}
