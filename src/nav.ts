import { create } from 'zustand';

export type Tab = 'depo' | 'cases' | 'inv' | 'contracts' | 'games' | 'store';
type N = {
  tab: Tab;
  caseId: string | null; // Kasalar sekmesi detay
  games: null | 'upgrade' | 'coin' | 'click';
  contracts: 'daily' | 'trade';
  profile: boolean;
  upgraderUid: string | null; // envanterden Upgrader'a gönder
  setTab: (t: Tab) => void;
  openCase: (id: string | null) => void;
  openGame: (g: N['games']) => void;
  setContracts: (c: N['contracts']) => void;
  setProfile: (v: boolean) => void;
  sendToUpgrader: (uid: string) => void;
  back: () => boolean;
};

export const useNav = create<N>((set, get) => ({
  tab: 'depo', caseId: null, games: null, contracts: 'daily', profile: false, upgraderUid: null,
  setTab: (tab) => set({ tab }),
  openCase: (caseId) => set({ caseId, tab: 'cases' }),
  openGame: (games) => set({ games, tab: 'games' }),
  setContracts: (contracts) => set({ contracts }),
  setProfile: (profile) => set({ profile }),
  sendToUpgrader: (uid) => set({ upgraderUid: uid, games: 'upgrade', tab: 'games' }),
  back: () => {
    const n = get();
    if (n.profile) { set({ profile: false }); return true; }
    if (n.tab === 'cases' && n.caseId) { set({ caseId: null }); return true; }
    if (n.tab === 'games' && n.games) { set({ games: null }); return true; }
    if (n.tab !== 'depo') { set({ tab: 'depo' }); return true; }
    return false;
  },
}));
