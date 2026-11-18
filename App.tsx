import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelFromXp } from './src/engine/game';
import { useGame } from './src/store/game';
import { usePrices } from './src/store/prices';
import { C, money } from './src/ui';
import Cases from './src/screens/Cases';
import Inventory from './src/screens/Inventory';
import Upgrader from './src/screens/Upgrader';
import Trade from './src/screens/Trade';
import Profile from './src/screens/Profile';

const Tab = createBottomTabNavigator();

function TopBar() {
  const ins = useSafeAreaInsets();
  const { balance, xp } = useGame();
  const lv = levelFromXp(xp);
  return (
    <View style={{ paddingTop: ins.top + 4, paddingHorizontal: 12, paddingBottom: 6, backgroundColor: C.card, borderBottomWidth: 1, borderColor: C.line }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: C.text, fontWeight: '800' }}>Sv.{lv.level}</Text>
        <Text style={{ color: C.green, fontWeight: '900', fontSize: 18 }}>{money(balance)}</Text>
      </View>
      <View style={{ height: 3, backgroundColor: C.card2, borderRadius: 2, marginTop: 4 }}>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: C.accent, width: `${Math.min(100, (lv.cur / lv.need) * 100)}%` }} />
      </View>
    </View>
  );
}

function Locked({ lvl, children }: { lvl: number; children: React.ReactNode }) {
  const xp = useGame((x) => x.xp);
  if (levelFromXp(xp).level >= lvl) return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40 }}>🔒</Text>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: '700', marginTop: 8 }}>Seviye {lvl}'de açılır</Text>
      <Text style={{ color: C.dim, marginTop: 4 }}>Kasa aç, XP kazan.</Text>
    </View>
  );
}

const UpgraderTab = () => <Locked lvl={5}><Upgrader /></Locked>;
const TradeTab = () => <Locked lvl={3}><Trade /></Locked>;

const icon = (e: string) => () => <Text style={{ fontSize: 18 }}>{e}</Text>;

export default function App() {
  const hydrated = useGame((x) => x.hydrated);
  const initPrices = usePrices((x) => x.init);
  useEffect(() => { initPrices(); }, []);
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.accent} size="large" /></View>;
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <TopBar />
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card, border: C.line, primary: C.accent } }}>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line }, tabBarLabelStyle: { fontSize: 11 } }}>
          <Tab.Screen name="Kasalar" component={Cases} options={{ tabBarIcon: icon('📦') }} />
          <Tab.Screen name="Envanter" component={Inventory} options={{ tabBarIcon: icon('🎒') }} />
          <Tab.Screen name="Takas" component={TradeTab} options={{ tabBarIcon: icon('🔁') }} />
          <Tab.Screen name="Upgrader" component={UpgraderTab} options={{ tabBarIcon: icon('⚡') }} />
          <Tab.Screen name="Profil" component={Profile} options={{ tabBarIcon: icon('👤') }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
