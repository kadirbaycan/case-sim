import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bundled from '../../prices.json';
import type { Prices } from '../engine/game';

// GitHub Actions derlemesi bu değişkeni otomatik doldurur (repo'daki prices.json)
const REMOTE = process.env.EXPO_PUBLIC_PRICES_URL || '';
const CACHE_KEY = 'prices-cache-v1';

type PriceFile = { updated: number; source: string; count: number; p: Prices };

type S = {
  p: Prices;
  updated: number;
  count: number;
  loading: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const b = bundled as unknown as PriceFile;

export const usePrices = create<S>((set, get) => ({
  p: b.p,
  updated: b.updated,
  count: b.count,
  loading: false,
  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const f = JSON.parse(raw) as PriceFile;
        if (f.updated > get().updated) set({ p: f.p, updated: f.updated, count: f.count });
      }
    } catch {}
    get().refresh();
  },
  refresh: async () => {
    if (!REMOTE) return false;
    set({ loading: true });
    try {
      const r = await fetch(`${REMOTE}?t=${Date.now()}`);
      if (!r.ok) throw new Error(String(r.status));
      const f = (await r.json()) as PriceFile;
      if (f.count > 0 && f.updated >= get().updated) {
        set({ p: f.p, updated: f.updated, count: f.count });
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(f)).catch(() => {});
      }
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
