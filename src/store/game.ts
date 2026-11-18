import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  CASE_BY_ID, Item, Rng, SELL_RATE, SKINS, START_BALANCE, casePrice, doTrade, itemPrice,
  makeItem, rollCase, upgradeChance, Prices,
} from '../engine/game';
import { sha256Hex } from '../engine/sha256';

const randHex = (n: number) =>
  Array.from(Crypto.getRandomBytes(n)).map((b) => b.toString(16).padStart(2, '0')).join('');

type Seeds = { serverSeed: string; clientSeed: string; nonce: number; lastRevealed?: string };

export type Stats = {
  opened: number; spent: number; earned: number; best: number; bestName: string;
  gold: number; upWins: number; upLoss: number; trades: number;
};

export const CLICK_UPGRADES = [
  { id: 'tap', name: 'Parmak Gücü', base: 5, grow: 1.35, desc: 'Tık başına +$0.01' },
  { id: 'auto', name: 'Otomatik Tıklayıcı', base: 25, grow: 1.4, desc: 'Saniyede +$0.02' },
];

type G = {
  balance: number;
  xp: number;
  inv: Item[];
  seeds: Seeds;
  stats: Stats;
  click: { tap: number; auto: number; last: number };
  sfx: boolean;
  fast: boolean;
  hydrated: boolean;
  // eylemler
  open: (caseId: string, count: number, prices: Prices) => Item[] | null;
  sell: (uids: string[], prices: Prices) => number;
  upgrade: (inputUid: string, targetSkinId: string, targetFloat: number, prices: Prices) => { win: boolean; chance: number; item?: Item } | null;
  trade: (uids: string[]) => Item | null;
  tap: () => void;
  collectAuto: () => number;
  buyClick: (id: 'tap' | 'auto') => boolean;
  rotateSeed: () => void;
  setClientSeed: (s: string) => void;
  addXp: (n: number) => void;
  setOpt: (k: 'sfx' | 'fast', v: boolean) => void;
  reset: () => void;
};

const freshSeeds = (): Seeds => ({ serverSeed: randHex(32), clientSeed: randHex(8), nonce: 0 });
const freshStats = (): Stats => ({ opened: 0, spent: 0, earned: 0, best: 0, bestName: '', gold: 0, upWins: 0, upLoss: 0, trades: 0 });
const r2 = (n: number) => Math.round(n * 100) / 100;

export const clickCost = (id: 'tap' | 'auto', lvl: number) => {
  const u = CLICK_UPGRADES.find((x) => x.id === id)!;
  return r2(u.base * Math.pow(u.grow, lvl));
};

export const useGame = create<G>()(
  persist(
    (set, get) => ({
      balance: START_BALANCE,
      xp: 0,
      inv: [],
      seeds: freshSeeds(),
      stats: freshStats(),
      click: { tap: 0, auto: 0, last: Date.now() },
      sfx: true,
      fast: false,
      hydrated: false,

      open: (caseId, count, prices) => {
        const c = CASE_BY_ID[caseId];
        const cost = r2(casePrice(c, prices) * count);
        const g = get();
        if (!c || g.balance < cost) return null;
        const items: Item[] = [];
        let nonce = g.seeds.nonce;
        for (let i = 0; i < count; i++) items.push(rollCase(c, new Rng(g.seeds, nonce++)));
        const st = { ...g.stats, opened: g.stats.opened + count, spent: r2(g.stats.spent + cost) };
        for (const it of items) {
          const v = itemPrice(it, prices).p;
          if (v > st.best) { st.best = r2(v); st.bestName = SKINS[it.skinId].n; }
          if (SKINS[it.skinId].t === 5) st.gold++;
        }
        set({
          balance: r2(g.balance - cost),
          inv: [...items, ...g.inv],
          seeds: { ...g.seeds, nonce },
          stats: st,
          xp: g.xp + count * 30 + Math.round(cost * 15),
        });
        return items;
      },

      sell: (uids, prices) => {
        const g = get();
        const set_ = new Set(uids);
        let total = 0;
        for (const it of g.inv) if (set_.has(it.uid)) total += itemPrice(it, prices).p * SELL_RATE;
        total = r2(total);
        set({
          balance: r2(g.balance + total),
          inv: g.inv.filter((i) => !set_.has(i.uid)),
          stats: { ...g.stats, earned: r2(g.stats.earned + total) },
        });
        return total;
      },

      upgrade: (inputUid, targetSkinId, targetFloat, prices) => {
        const g = get();
        const inp = g.inv.find((i) => i.uid === inputUid);
        if (!inp) return null;
        const target = makeItem(targetSkinId, new Rng(g.seeds, g.seeds.nonce), targetFloat);
        const chance = upgradeChance(itemPrice(inp, prices).p, itemPrice(target, prices).p);
        const roll = new Rng(g.seeds, g.seeds.nonce + 1).next();
        const win = roll < chance;
        const inv = g.inv.filter((i) => i.uid !== inputUid);
        if (win) inv.unshift(target);
        set({
          inv,
          seeds: { ...g.seeds, nonce: g.seeds.nonce + 2 },
          xp: g.xp + (win ? 80 : 25),
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
        set({
          inv: [out, ...g.inv.filter((i) => !rm.has(i.uid))],
          seeds: { ...g.seeds, nonce: g.seeds.nonce + 1 },
          xp: g.xp + 120,
          stats: { ...g.stats, trades: g.stats.trades + 1 },
        });
        return out;
      },

      tap: () => {
        const g = get();
        set({ balance: r2(g.balance + 0.01 * (1 + g.click.tap)) });
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

      rotateSeed: () => {
        const g = get();
        set({ seeds: { ...freshSeeds(), clientSeed: g.seeds.clientSeed, lastRevealed: g.seeds.serverSeed } });
      },
      setClientSeed: (s) => set({ seeds: { ...get().seeds, clientSeed: s.slice(0, 32) || 'client' } }),
      addXp: (n) => set({ xp: get().xp + n }),
      setOpt: (k, v) => set({ [k]: v } as Partial<G>),
      reset: () =>
        set({
          balance: START_BALANCE, xp: 0, inv: [], seeds: freshSeeds(), stats: freshStats(),
          click: { tap: 0, auto: 0, last: Date.now() },
        }),
    }),
    {
      name: 'case-sim-save-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        balance: s.balance, xp: s.xp, inv: s.inv, seeds: s.seeds, stats: s.stats,
        click: s.click, sfx: s.sfx, fast: s.fast,
      }),
      onRehydrateStorage: () => () => useGame.setState({ hydrated: true }),
    },
  ),
);

export const seedHash = (s: Seeds) => sha256Hex(s.serverSeed);
