import React, { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed';
import { LinearGradient } from 'expo-linear-gradient';
import { levelFromXp } from './src/engine/game';
import { useGame } from './src/store/game';
import { usePrices } from './src/store/prices';
import { Tab, useNav } from './src/nav';
import { Icon, IconName } from './src/icons';
import { LevelRing, Sheet, Text, Toast, UndoBar, money, C } from './src/ui';
import { rankTitle } from './src/engine/extra';
import Depo from './src/screens/Depo';
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
  const canBack = (tab === 'cases' && !!caseId) || (tab === 'games' && !!games) || tab === 'contracts';
  return (
    <View style={{ paddingTop: ins.top + 6, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg }}>
      {canBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => back()} hitSlop={10} style={{ width: 28, height: 44, justifyContent: 'center' }}>
          <Icon name="back" size={24} color={C.text} />
        </Pressable>
      ) : null}
      <LevelRing level={lv.level} p={lv.cur / lv.need} onPress={() => setProfile(true)} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={1} style={{ color: C.faint, fontSize: 11, fontWeight: '700', letterSpacing: 2.2, textTransform: 'uppercase' }}>{rankTitle(lv.level)}</Text>
        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>{lv.cur.toLocaleString('en-US')} / {lv.need.toLocaleString('en-US')} XP</Text>
      </View>
      <View accessible accessibilityLabel={`Bakiye ${balance.toFixed(2)} dolar`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderBottomWidth: 2, borderBottomColor: C.tealDim, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
        <Text style={{ color: C.faint, fontSize: 16, fontWeight: '700' }}>$</Text>
        <Text style={{ color: C.green, fontSize: 24, fontWeight: '800' }}>{money(balance).slice(1)}</Text>
      </View>
    </View>
  );
}

const TABS: { k: Tab; icon: IconName; label: string }[] = [
  { k: 'depo', icon: 'depo', label: 'Depo' },
  { k: 'cases', icon: 'box', label: 'Kasalar' },
  { k: 'inv', icon: 'bag', label: 'Kasam' },
  { k: 'games', icon: 'bench', label: 'Atölye' },
  { k: 'store', icon: 'store', label: 'Mağaza' },
];

function TabBar() {
  const ins = useSafeAreaInsets();
  const { tab, setTab, caseId, openCase, games, openGame } = useNav();
  const mDone = useGame((x) => x.missions.list.filter((m) => m.progress >= m.target && !m.claimed).length);
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: '#0f141c', borderTopWidth: 1, borderColor: C.line, paddingBottom: Math.max(ins.bottom, 8), paddingTop: 6, paddingHorizontal: 6 }}>
      {TABS.map((t) => {
        const on = tab === t.k || (t.k === 'depo' && tab === 'contracts');
        return (
          <Pressable key={t.k} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', minHeight: 52 }}
            onPress={() => { if (on && t.k === 'cases' && caseId) openCase(null); else if (on && t.k === 'games' && games) openGame(null); else setTab(t.k); }}>
            <View style={{ width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.amber : 'transparent' }}>
              <Icon name={t.icon} size={22} color={on ? C.amberInk : C.faint} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: on ? C.text : C.faint, marginTop: 2 }}>{t.label}</Text>
            {t.k === 'depo' && mDone > 0 && <View style={{ position: 'absolute', top: 0, right: '24%', width: 11, height: 11, borderRadius: 6, backgroundColor: C.red, borderWidth: 2, borderColor: '#0f141c' }} />}
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
        {tab === 'depo' && <Depo />}
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
  const [fontsLoaded] = useFonts({ Barlow_500Medium, Barlow_600SemiBold, BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold });
  useEffect(() => { initPrices(); }, []);
  if (!hydrated || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.amber} size="large" /></View>;
  }
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
