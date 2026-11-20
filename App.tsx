import React, { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { levelFromXp } from './src/engine/game';
import { useGame } from './src/store/game';
import { usePrices } from './src/store/prices';
import { Tab, useNav } from './src/nav';
import { Icon, IconName } from './src/icons';
import { Bar, LevelRing, Sheet, Text, Toast, UndoBar, money, C } from './src/ui';
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
    <View style={{ paddingTop: ins.top + 6, paddingHorizontal: 12, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg }}>
      {canBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => back()} hitSlop={10} style={{ width: 28, height: 44, justifyContent: 'center' }}>
          <Icon name="back" size={24} color={C.text} />
        </Pressable>
      ) : null}
      <LevelRing level={lv.level} p={lv.cur / lv.need} onPress={() => setProfile(true)} />
      <View style={{ flex: 1, marginLeft: 10, marginRight: 10 }}>
        <Text numberOfLines={1} style={{ color: C.dim, fontSize: 13, fontWeight: '700', letterSpacing: 0.6 }}>{lv.cur.toLocaleString('en-US')} / {lv.need.toLocaleString('en-US')} XP</Text>
        <Bar v={lv.cur / lv.need} h={6} style={{ marginTop: 4 }} />
      </View>
      <View accessible accessibilityLabel={`Bakiye ${balance.toFixed(2)} dolar`} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: C.green, fontSize: 28, fontWeight: '700' }}>$ {money(balance).slice(1)}</Text>
      </View>
    </View>
  );
}

const TABS: { k: Tab; icon: IconName; label: string }[] = [
  { k: 'cases', icon: 'box', label: 'Kasalar' },
  { k: 'inv', icon: 'bag', label: 'Envanter' },
  { k: 'contracts', icon: 'swap', label: 'Kontratlar' },
  { k: 'games', icon: 'game', label: 'Oyunlar' },
  { k: 'store', icon: 'store', label: 'Mağaza' },
];

function TabBar() {
  const ins = useSafeAreaInsets();
  const { tab, setTab, caseId, openCase, games, openGame } = useNav();
  const mDone = useGame((x) => x.missions.list.filter((m) => m.progress >= m.target && !m.claimed).length);
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderColor: C.line, paddingBottom: Math.max(ins.bottom, 6), paddingHorizontal: 4 }}>
      {TABS.map((t) => {
        const on = tab === t.k;
        return (
          <Pressable key={t.k} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', minHeight: 54, justifyContent: 'center' }}
            onPress={() => { if (on && t.k === 'cases' && caseId) openCase(null); else if (on && t.k === 'games' && games) openGame(null); else setTab(t.k); }}>
            {on ? <View style={{ position: 'absolute', top: 0, width: 34, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: C.green }} /> : null}
            <Icon name={t.icon} size={22} color={on ? C.green : C.faint} />
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: on ? C.green : C.faint, marginTop: 2 }}>{t.label}</Text>
            {t.k === 'contracts' && mDone > 0 && <View style={{ position: 'absolute', top: 6, right: '26%', minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}><Text style={{ fontSize: 11, fontWeight: '700', lineHeight: 14 }}>{mDone}</Text></View>}
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
      <UndoBar />
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
