import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  CASES, CASE_BY_ID, Item, Prices, Rng, SELL_RATE, SKINS, START_BALANCE, casePrice, doTrade, itemPrice,
  levelFromXp, makeItem, rollCase, upgradeChance,
} from '../engine/game';
import { sha256Hex } from '../engine/sha256';
import {
  Mission, MissionType, Prize, SEASON_DAYS, STARS_PER_TIER, SUPPLY_MS, WHEEL, dayKey, makeMissions, seasonReward,
} from '../engine/extra';

const randHex = (n: number) => Array.from(Crypto.getRandomBytes(n)).map((b) => b.toString(16).padStart(2, '0')).join('');
const r2 = (n: number) => Math.round(n * 100) / 100;

type Seeds = { serverSeed: string; clientSeed: string; nonce: number; lastRevealed?: string };
export type Stats = {
  opened: number; spent: number; earned: number; best: number; bestName: string;
  gold: number; upWins: number; upLoss: number; trades: number; flips: number; flipWins: number;
};
export const CLICK_UPGRADES = [
  { id: 'tap', name: 'Parmak Gücü', base: 5, grow: 1.35, desc: 'Tık başına +$0.01' },
  { id: 'auto', name: 'Otomatik Tıklayıcı', base: 25, grow: 1.4, desc: 'Saniyede +$0.02' },
];
export const MASS_PRICE = 250;
export const BOOST_PRICE = 20;

type G = {
  balance: number; xp: number; inv: Item[]; seeds: Seeds; stats: Stats;
  click: { tap: number; auto: number; last: number };
  sfx: boolean; quick: boolean; autoSpin: boolean; autoSell: { on: boolean; max: number };
  favs: string[]; freeCases: Record<string, number>; perCase: Record<string, number>;
  missions: { day: string; list: Mission[] };
  stars: number; seasonStart: number; seasonClaimed: number[];
  supplyAt: number; spinDay: string; pendingPrize: Prize | null;
  massOpen: boolean; xpBoostUntil: number; rewardedLevel: number;
  toast: { id: number; text: string } | null;
  hydrated: boolean;
  unseen: { caseId: string; uids: string[] } | null;
  undo: { items: Item[]; total: number; ts: number } | null;

  ensureDaily: () => void;
  open: (caseId: string, count: number, prices: Prices) => { items: Item[]; free: number; cost: number } | null;
  sell: (uids: string[], prices: Prices, undoable?: boolean) => number;
  undoSell: () => void;
  clearUndo: () => void;
  clearUnseen: () => void;
  upgrade: (inputUid: string, targetSkinId: string, targetFloat: number, prices: Prices) => { win: boolean; chance: number; item?: Item } | null;
  trade: (uids: string[]) => Item | null;
  coinflip: (bet: number, pickHeads: boolean) => { win: boolean; heads: boolean } | null;
  tapMany: (n: number) => void;
  collectAuto: () => number;
  buyClick: (id: 'tap' | 'auto') => boolean;
  claimMission: (id: string) => void;
  claimTier: (tier: number) => void;
  claimSupply: () => boolean;
  rollWheel: () => { index: number; prize: Prize } | null;
  payPrize: () => void;
  buyMass: () => boolean;
  buyBoost: () => boolean;
  toggleFav: (id: string) => void;
  rotateSeed: () => void;
  setClientSeed: (s: string) => void;
  setOpt: (k: 'sfx' | 'quick' | 'autoSpin', v: boolean) => void;
  setAutoSell: (on: boolean, max?: number) => void;
  say: (text: string) => void;
  reset: () => void;
};

const freshSeeds = (): Seeds => ({ serverSeed: randHex(32), clientSeed: randHex(8), nonce: 0 });
const freshStats = (): Stats => ({ opened: 0, spent: 0, earned: 0, best: 0, bestName: '', gold: 0, upWins: 0, upLoss: 0, trades: 0, flips: 0, flipWins: 0 });
export const clickCost = (id: 'tap' | 'auto', lvl: number) => {
  const u = CLICK_UPGRADES.find((x) => x.id === id)!;
  return r2(u.base * Math.pow(u.grow, lvl));
};
let toastId = 1;

type Slice = Pick<G, 'balance' | 'xp' | 'freeCases' | 'rewardedLevel' | 'xpBoostUntil' | 'missions' | 'stars' | 'toast'>;

function missionsFor(g: { missions: G['missions'] }): G['missions'] {
  const d = dayKey();
  return g.missions.day === d ? g.missions : { day: d, list: makeMissions(d) };
}
function bump(g: { missions: G['missions'] }, type: MissionType, n: number): G['missions'] {
  const m = missionsFor(g);
  return { day: m.day, list: m.list.map((x) => (x.type === type ? { ...x, progress: Math.min(x.target, x.progress + n) } : x)) };
}

// XP + seviye ödülleri
function withXp(g: Slice, gain: number): Partial<Slice> {
  const mult = Date.now() < g.xpBoostUntil ? 2 : 1;
  const xp = g.xp + Math.round(gain * mult);
  const before = levelFromXp(g.xp).level;
  const after = levelFromXp(xp).level;
  let balance = g.balance;
  const free = { ...g.freeCases };
  const notes: string[] = [];
  for (let l = Math.max(before + 1, g.rewardedLevel + 1); l <= after; l++) {
    const cash = r2(l * 0.5);
    balance = r2(balance + cash);
    let t = `Seviye ${l}! +$${cash}`;
    if (l % 5 === 0) {
      const cid = CASES[(l * 3) % CASES.length].id;
      free[cid] = (free[cid] || 0) + 3;
      t += ` · 3 ücretsiz ${CASE_BY_ID[cid].name}`;
    }
    notes.push(t);
  }
  const out: Partial<Slice> = { xp };
  if (notes.length) {
    out.balance = balance;
    out.freeCases = free;
    out.rewardedLevel = Math.max(g.rewardedLevel, after);
    out.toast = { id: toastId++, text: notes[notes.length - 1] };
  }
  return out;
}

export const useGame = create<G>()(
  persist(
    (set, get) => ({
      balance: START_BALANCE, xp: 0, inv: [], seeds: freshSeeds(), stats: freshStats(),
      click: { tap: 0, auto: 0, last: Date.now() },
      sfx: true, quick: false, autoSpin: false, autoSell: { on: false, max: 0.5 },
      favs: [], freeCases: {}, perCase: {},
      missions: { day: '', list: [] },
      stars: 0, seasonStart: Date.now(), seasonClaimed: [],
      supplyAt: 0, spinDay: '', pendingPrize: null,
      massOpen: false, xpBoostUntil: 0, rewardedLevel: 1,
      toast: null, hydrated: false, unseen: null, undo: null,

      ensureDaily: () => {
        const g = get();
        const patch: Partial<G> = {};
        const m = missionsFor(g);
        if (m !== g.missions) patch.missions = m;
        if (Date.now() - g.seasonStart > SEASON_DAYS * 86400000) {
          patch.seasonStart = Date.now(); patch.stars = 0; patch.seasonClaimed = [];
        }
        if (Object.keys(patch).length) set(patch);
        if (g.pendingPrize) get().payPrize();
      },

      open: (caseId, count, prices) => {
        const g = get();
        const c = CASE_BY_ID[caseId];
        if (!c) return null;
        const free = Math.min(count, g.freeCases[caseId] || 0);
        const cost = r2(casePrice(c, prices) * (count - free));
        if (g.balance < cost) return null;
        const items: Item[] = [];
        let nonce = g.seeds.nonce;
        for (let i = 0; i < count; i++) items.push(rollCase(c, new Rng(g.seeds, nonce++)));
        const st = { ...g.stats, opened: g.stats.opened + count, spent: r2(g.stats.spent + cost) };
        let covert = 0;
        for (const it of items) {
          const v = itemPrice(it, prices).p;
          if (v > st.best) { st.best = r2(v); st.bestName = SKINS[it.skinId].n; }
          if (SKINS[it.skinId].t === 5) st.gold++;
          if (SKINS[it.skinId].t >= 4) covert++;
        }
        let missions = bump(g, 'open', count);
        if (cost > 0) missions = bump({ missions }, 'spend', Math.floor(cost));
        if (covert) missions = bump({ missions }, 'covert', covert);
        const fc = { ...g.freeCases };
        if (free) fc[caseId] = (fc[caseId] || 0) - free;
        const base: Slice = { balance: r2(g.balance - cost), xp: g.xp, freeCases: fc, rewardedLevel: g.rewardedLevel, xpBoostUntil: g.xpBoostUntil, missions, stars: g.stars, toast: g.toast };
        set({
          ...base, ...withXp(base, count * 30 + Math.round(cost * 15)),
          inv: [...items, ...g.inv], seeds: { ...g.seeds, nonce }, stats: st,
          unseen: { caseId, uids: items.map((i) => i.uid) },
          perCase: { ...g.perCase, [caseId]: (g.perCase[caseId] || 0) + count },
        });
        return { items, free, cost };
      },

      sell: (uids, prices, undoable = true) => {
        const g = get();
        const rm = new Set(uids);
        let total = 0, n = 0;
        const gone: Item[] = [];
        for (const it of g.inv) if (rm.has(it.uid)) { total += itemPrice(it, prices).p * SELL_RATE; n++; gone.push(it); }
        total = r2(total);
        set({
          balance: r2(g.balance + total),
          inv: g.inv.filter((i) => !rm.has(i.uid)),
          stats: { ...g.stats, earned: r2(g.stats.earned + total) },
          missions: bump(g, 'sell', n),
          undo: undoable && n ? { items: gone, total, ts: Date.now() } : g.undo,
        });
        return total;
      },

      undoSell: () => {
        const g = get();
        const u = g.undo;
        if (!u) return;
        set({
          balance: r2(Math.max(0, g.balance - u.total)),
          inv: [...u.items, ...g.inv],
          stats: { ...g.stats, earned: r2(Math.max(0, g.stats.earned - u.total)) },
          undo: null,
          toast: { id: toastId++, text: 'Satış geri alındı' },
        });
      },
      clearUndo: () => set({ undo: null }),
      clearUnseen: () => set({ unseen: null }),

      upgrade: (inputUid, targetSkinId, targetFloat, prices) => {
        const g = get();
        const inp = g.inv.find((i) => i.uid === inputUid);
        if (!inp) return null;
        const target = makeItem(targetSkinId, new Rng(g.seeds, g.seeds.nonce), targetFloat);
        const chance = upgradeChance(itemPrice(inp, prices).p, itemPrice(target, prices).p);
        const win = new Rng(g.seeds, g.seeds.nonce + 1).next() < chance;
        const inv = g.inv.filter((i) => i.uid !== inputUid);
        if (win) inv.unshift(target);
        const base: Slice = { balance: g.balance, xp: g.xp, freeCases: g.freeCases, rewardedLevel: g.rewardedLevel, xpBoostUntil: g.xpBoostUntil, missions: bump(g, 'upgrade', 1), stars: g.stars, toast: g.toast };
        set({
          ...base, ...withXp(base, win ? 80 : 25), inv, seeds: { ...g.seeds, nonce: g.seeds.nonce + 2 },
          stats: { ...g.stats, upWins: g.stats.upWins + (win ? 1 : 0), upLoss: g.stats.upLoss + (win ? 0 : 1) },
        });
        return { win, chance, item: win ? target : undefined };
      },

      trade: (uids) => {
        const g = get();
        const ins = uids.map((u) => g.inv.find((i) => i.uid === u)).filter(Boolean) as Item[];
        if (ins.length !== 10) return null;
        const out = doTrade(ins, new Rng(g.seeds, g.seeds.nonce));
        if (!out) return null;
        const rm = new Set(uids);
        const base: Slice = { balance: g.balance, xp: g.xp, freeCases: g.freeCases, rewardedLevel: g.rewardedLevel, xpBoostUntil: g.xpBoostUntil, missions: bump(g, 'trade', 1), stars: g.stars, toast: g.toast };
        set({
          ...base, ...withXp(base, 120), inv: [out, ...g.inv.filter((i) => !rm.has(i.uid))],
          seeds: { ...g.seeds, nonce: g.seeds.nonce + 1 }, stats: { ...g.stats, trades: g.stats.trades + 1 },
        });
        return out;
      },

      coinflip: (bet, pickHeads) => {
        const g = get();
        if (bet <= 0 || g.balance < bet) return null;
        const heads = new Rng(g.seeds, g.seeds.nonce).next() < 0.5;
        const win = heads === pickHeads;
        const delta = win ? r2(bet * 0.9) : -bet; // %5 ev payı: 1.9x ödeme
        set({
          balance: r2(g.balance + delta), seeds: { ...g.seeds, nonce: g.seeds.nonce + 1 },
          stats: { ...g.stats, flips: g.stats.flips + 1, flipWins: g.stats.flipWins + (win ? 1 : 0) },
          xp: g.xp + 10,
        });
        return { win, heads };
      },

      tapMany: (n) => {
        const g = get();
        set({ balance: r2(g.balance + n * 0.01 * (1 + g.click.tap)), missions: bump(g, 'tap', n) });
      },
      collectAuto: () => {
        const g = get();
        const now = Date.now();
        const secs = Math.min(8 * 3600, Math.max(0, (now - g.click.last) / 1000));
        const gain = g.click.auto > 0 ? r2(secs * 0.02 * g.click.auto) : 0;
        set({ click: { ...g.click, last: now }, balance: r2(g.balance + gain) });
        return gain;
      },
      buyClick: (id) => {
        const g = get();
        const cost = clickCost(id, g.click[id]);
        if (g.balance < cost) return false;
        set({ balance: r2(g.balance - cost), click: { ...g.click, [id]: g.click[id] + 1 } });
        return true;
      },

      claimMission: (id) => {
        const g = get();
        const m = g.missions.list.find((x) => x.id === id);
        if (!m || m.claimed || m.progress < m.target) return;
        set({
          stars: g.stars + m.stars, balance: r2(g.balance + m.cash),
          missions: { ...g.missions, list: g.missions.list.map((x) => (x.id === id ? { ...x, claimed: true } : x)) },
          toast: { id: toastId++, text: `Görev tamam! +${m.stars}★ +$${m.cash}` },
        });
      },

      claimTier: (tier) => {
        const g = get();
        if (g.seasonClaimed.includes(tier) || g.stars < tier * STARS_PER_TIER) return;
        const r = seasonReward(tier);
        const patch: Partial<G> = { seasonClaimed: [...g.seasonClaimed, tier] };
        let text = '';
        if (r.kind === 'cash') { patch.balance = r2(g.balance + r.amount); text = `+$${r.amount}`; }
        if (r.kind === 'case') { patch.freeCases = { ...g.freeCases, [r.caseId]: (g.freeCases[r.caseId] || 0) + r.n }; text = `${r.n} ücretsiz ${CASE_BY_ID[r.caseId].name}`; }
        if (r.kind === 'skin') {
          const it = makeItem(r.skinId, new Rng(g.seeds, g.seeds.nonce));
          patch.inv = [it, ...g.inv]; patch.seeds = { ...g.seeds, nonce: g.seeds.nonce + 1 };
          text = SKINS[r.skinId].n;
        }
        patch.toast = { id: toastId++, text: `Sezon ödülü: ${text}` };
        set(patch);
      },

      claimSupply: () => {
        const g = get();
        if (Date.now() < g.supplyAt) return false;
        const rng = new Rng(g.seeds, g.seeds.nonce);
        const patch: Partial<G> = { supplyAt: Date.now() + SUPPLY_MS, seeds: { ...g.seeds, nonce: g.seeds.nonce + 1 } };
        if (rng.next() < 0.7) {
          const amt = r2(0.3 + rng.next() * 2.2);
          patch.balance = r2(g.balance + amt);
          patch.toast = { id: toastId++, text: `Supply Drop: +$${amt}` };
        } else {
          const cid = CASES[Math.floor(rng.next() * Math.min(12, CASES.length))].id;
          const n = 1 + Math.floor(rng.next() * 3);
          patch.freeCases = { ...g.freeCases, [cid]: (g.freeCases[cid] || 0) + n };
          patch.toast = { id: toastId++, text: `Supply Drop: ${n} ücretsiz ${CASE_BY_ID[cid].name}` };
        }
        set(patch);
        return true;
      },

      rollWheel: () => {
        const g = get();
        if (g.spinDay === dayKey()) return null;
        const total = WHEEL.reduce((a, p) => a + p.weight, 0);
        let x = new Rng(g.seeds, g.seeds.nonce).next() * total;
        let index = WHEEL.length - 1;
        for (let i = 0; i < WHEEL.length; i++) { if (x < WHEEL[i].weight) { index = i; break; } x -= WHEEL[i].weight; }
        set({ spinDay: dayKey(), seeds: { ...g.seeds, nonce: g.seeds.nonce + 1 }, pendingPrize: WHEEL[index] });
        return { index, prize: WHEEL[index] };
      },
      payPrize: () => {
        const g = get();
        const p = g.pendingPrize;
        if (!p) return;
        const patch: Partial<G> = { pendingPrize: null, toast: { id: toastId++, text: `Çark: ${p.label}` } };
        if (p.cash) patch.balance = r2(g.balance + p.cash);
        if (p.freeCase) {
          const cid = CASES[Math.floor(Math.random() * Math.min(12, CASES.length))].id;
          patch.freeCases = { ...g.freeCases, [cid]: (g.freeCases[cid] || 0) + p.freeCase };
          patch.toast = { id: toastId++, text: `Çark: ${p.freeCase} ücretsiz ${CASE_BY_ID[cid].name}` };
        }
        set(patch);
      },

      buyMass: () => {
        const g = get();
        if (g.massOpen || g.balance < MASS_PRICE) return false;
        set({ balance: r2(g.balance - MASS_PRICE), massOpen: true });
        return true;
      },
      buyBoost: () => {
        const g = get();
        if (g.balance < BOOST_PRICE) return false;
        set({ balance: r2(g.balance - BOOST_PRICE), xpBoostUntil: Math.max(Date.now(), g.xpBoostUntil) + 3600000 });
        return true;
      },

      toggleFav: (id) => { const f = get().favs; set({ favs: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] }); },
      rotateSeed: () => { const g = get(); set({ seeds: { ...freshSeeds(), clientSeed: g.seeds.clientSeed, lastRevealed: g.seeds.serverSeed } }); },
      setClientSeed: (s) => set({ seeds: { ...get().seeds, clientSeed: s.slice(0, 32) || 'client' } }),
      setOpt: (k, v) => set({ [k]: v } as Partial<G>),
      setAutoSell: (on, max) => set({ autoSell: { on, max: max ?? get().autoSell.max } }),
      say: (text) => set({ toast: { id: toastId++, text } }),
      reset: () =>
        set({
          balance: START_BALANCE, xp: 0, inv: [], seeds: freshSeeds(), stats: freshStats(),
          click: { tap: 0, auto: 0, last: Date.now() }, favs: [], freeCases: {}, perCase: {},
          missions: { day: '', list: [] }, stars: 0, seasonStart: Date.now(), seasonClaimed: [],
          supplyAt: 0, spinDay: '', pendingPrize: null, massOpen: false, xpBoostUntil: 0, rewardedLevel: 1,
        }),
    }),
    {
      name: 'case-sim-save-v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        balance: s.balance, xp: s.xp, inv: s.inv, seeds: s.seeds, stats: s.stats, click: s.click,
        sfx: s.sfx, quick: s.quick, autoSpin: s.autoSpin, autoSell: s.autoSell, favs: s.favs,
        freeCases: s.freeCases, perCase: s.perCase, missions: s.missions, stars: s.stars,
        seasonStart: s.seasonStart, seasonClaimed: s.seasonClaimed, supplyAt: s.supplyAt, spinDay: s.spinDay,
        unseen: s.unseen, pendingPrize: s.pendingPrize, massOpen: s.massOpen, xpBoostUntil: s.xpBoostUntil, rewardedLevel: s.rewardedLevel,
      }),
      migrate: (p) => p as any,
      merge: (persisted, current) => ({
        ...current, ...(persisted as object),
        stats: { ...current.stats, ...((persisted as any)?.stats || {}) },
        autoSell: { ...current.autoSell, ...((persisted as any)?.autoSell || {}) },
        // eski kayıtta rewardedLevel yoksa mevcut seviyeye göre ayarla (geriye dönük ödül yağmasın)
        rewardedLevel: (persisted as any)?.rewardedLevel ?? levelFromXp((persisted as any)?.xp || 0).level,
      }),
      onRehydrateStorage: () => () => useGame.setState({ hydrated: true }),
    },
  ),
);

export const seedHash = (s: Seeds) => sha256Hex(s.serverSeed);
