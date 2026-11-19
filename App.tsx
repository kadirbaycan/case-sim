import React, { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { LinearGradient } from 'expo-linear-gradient';
import { levelFromXp } from './src/engine/game';
import { useGame } from './src/store/game';
import { usePrices } from './src/store/prices';
import { Tab, useNav } from './src/nav';
import { Bar, Sheet, Text, Toast, money, C } from './src/ui';
import Cases from './src/screens/Cases';
import Inventory from './src/screens/Inventory';
import Contracts from './src/screens/Contracts';
import Games from './src/screens/Games';
import Store from './src/screens/Store';
import Profile from './src/screens/Profile';

function TopBar() {
  const ins = useSafeAreaInsets();
  const balance = useGame((x) => x.balance);
  const xp = useGame((x) => x.xp);
  const { tab, caseId, games, setProfile, back } = useNav();
  const lv = levelFromXp(xp);
  const canBack = (tab === 'cases' && !!caseId) || (tab === 'games' && !!games);
  return (
    <View style={{ paddingTop: ins.top + 6, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg }}>
      <Pressable onPress={() => back()} disabled={!canBack} hitSlop={10} style={{ width: 30, opacity: canBack ? 1 : 0.15 }}>
        <Text style={{ fontSize: 30, color: C.text, lineHeight: 32 }}>‹</Text>
      </Pressable>
      <Pressable onPress={() => setProfile(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <LinearGradient colors={['#43506b', '#2a3246']} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.blue }}>
          <Text style={{ fontSize: 22 }}>🎯</Text>
        </LinearGradient>
        <View style={{ marginLeft: 8, width: 92 }}>
          <Text style={{ fontWeight: '700', fontSize: 18, lineHeight: 20 }}>SV. {lv.level}</Text>
          <Bar v={lv.cur / lv.need} h={5} color={C.blue} />
        </View>
      </Pressable>
      <View style={{ flex: 1 }} />
      <Text style={{ color: C.green, fontWeight: '700', fontSize: 26 }}>{money(balance)}</Text>
    </View>
  );
}

const TABS: { k: Tab; icon: string; label: string }[] = [
  { k: 'cases', icon: '📦', label: 'Kasalar' },
  { k: 'inv', icon: '🎒', label: 'Envanter' },
  { k: 'contracts', icon: '📋', label: 'Kontratlar' },
  { k: 'games', icon: '🎮', label: 'Oyunlar' },
  { k: 'store', icon: '🛍️', label: 'Mağaza' },
];

function TabBar() {
  const ins = useSafeAreaInsets();
  const { tab, setTab, caseId, openCase, games, openGame } = useNav();
  const mDone = useGame((x) => x.missions.list.filter((m) => m.progress >= m.target && !m.claimed).length);
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderColor: C.line, paddingBottom: ins.bottom, paddingTop: 6 }}>
      {TABS.map((t) => {
        const on = tab === t.k;
        return (
          <Pressable key={t.k} style={{ flex: 1, alignItems: 'center', paddingVertical: 2 }}
            onPress={() => { if (on && t.k === 'cases' && caseId) openCase(null); else if (on && t.k === 'games' && games) openGame(null); else setTab(t.k); }}>
            {on && <View style={{ position: 'absolute', top: -7, width: 34, height: 3, borderRadius: 2, backgroundColor: C.green }} />}
            <Text style={{ fontSize: 22, opacity: on ? 1 : 0.55 }}>{t.icon}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: on ? C.text : C.dim }}>{t.label}</Text>
            {t.k === 'contracts' && mDone > 0 && <View style={{ position: 'absolute', top: 0, right: '28%', minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#000', fontSize: 11, fontWeight: '700' }}>{mDone}</Text></View>}
          </Pressable>
        );
      })}
    </View>
  );
}

function Main() {
  const tab = useNav((n) => n.tab);
  const profile = useNav((n) => n.profile);
  const setProfile = useNav((n) => n.setProfile);
  const toast = useGame((x) => x.toast);
  const ensure = useGame((x) => x.ensureDaily);

  useEffect(() => { ensure(); }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => useNav.getState().back());
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <TopBar />
      <View style={{ flex: 1 }}>
        {tab === 'cases' && <Cases />}
        {tab === 'inv' && <Inventory />}
        {tab === 'contracts' && <Contracts />}
        {tab === 'games' && <Games />}
        {tab === 'store' && <Store />}
      </View>
      <TabBar />
      <Sheet visible={profile} onClose={() => setProfile(false)} full>
        <Profile />
      </Sheet>
      <Toast text={toast?.text ?? null} id={toast?.id ?? 0} />
    </View>
  );
}

export default function App() {
  const hydrated = useGame((x) => x.hydrated);
  const initPrices = usePrices((x) => x.init);
  const [fontsLoaded] = useFonts({ Rajdhani_600SemiBold, Rajdhani_700Bold });
  useEffect(() => { initPrices(); }, []);
  if (!hydrated || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.green} size="large" /></View>;
  }
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
