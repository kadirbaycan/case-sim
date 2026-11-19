import React, { useRef, useState } from 'react';
import { Animated, Easing, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WHEEL, dayKey, fmtTime } from '../engine/extra';
import { BOOST_PRICE, MASS_PRICE, useGame } from '../store/game';
import { play, haptic } from '../sound';
import { Btn, C, Text, money, st } from '../ui';
import { Icon, IconName } from '../icons';

const CELL = 96;

export default function Store() {
  const g = useGame();
  const roll = useGame((x) => x.rollWheel);
  const pay = useGame((x) => x.payPrize);
  const buyMass = useGame((x) => x.buyMass);
  const buyBoost = useGame((x) => x.buyBoost);
  const say = useGame((x) => x.say);
  const [busy, setBusy] = useState(false);
  const [vw, setVw] = useState(0);
  const [strip, setStrip] = useState<number[] | null>(null);
  const x = useRef(new Animated.Value(0)).current;
  const ready = g.spinDay !== dayKey();
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);

  const spin = () => {
    if (busy || !ready || !vw) return;
    const r = roll();
    if (!r) return;
    setBusy(true);
    // Şerit: rastgele dilimler, kazanan 30. sırada
    const items = Array.from({ length: 40 }, () => Math.floor(Math.random() * WHEEL.length));
    items[30] = r.index;
    setStrip(items);
    x.setValue(0);
    play('unlock');
    let last = -1;
    const id = x.addListener(({ value }) => { const i = Math.floor((-value + vw / 2) / CELL); if (i !== last) { last = i; play('tick'); } });
    const target = -(30 * CELL + CELL / 2 - vw / 2 + (Math.random() - 0.5) * (CELL - 24));
    Animated.timing(x, { toValue: target, duration: 5200, easing: Easing.bezier(0.08, 0.7, 0.12, 1), useNativeDriver: true }).start(() => {
      x.removeListener(id);
      pay(); play(r.prize.cash && r.prize.cash >= 25 ? 'winGold' : 'winMid'); haptic('success'); setBusy(false);
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <LinearGradient colors={['#1d3a22', '#101a12']} style={{ borderRadius: 16, padding: 14, borderWidth: 1, borderColor: ready ? C.green : C.line }}>
        <Text style={{ fontWeight: '700', fontSize: 22 }}>GÜNLÜK ÇARK</Text>
        <Text style={st.dim}>Günde bir kez ücretsiz. Ödül nakit ya da ücretsiz kasa.</Text>
        <View onLayout={(e) => setVw(e.nativeEvent.layout.width)} style={{ height: 96, marginVertical: 12, backgroundColor: C.card, borderRadius: 12, overflow: 'hidden' }}>
          {strip ? (
            <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
              {strip.map((pi, i) => (
                <View key={i} style={{ width: CELL, height: 96, padding: 4 }}>
                  <View style={{ flex: 1, borderRadius: 10, backgroundColor: WHEEL[pi].color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 19 }}>{WHEEL[pi].label}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          ) : (
            <ScrollView horizontal scrollEnabled={false} contentContainerStyle={{ alignItems: 'center' }}>
              {WHEEL.map((p) => (
                <View key={p.label} style={{ width: CELL, height: 96, padding: 4 }}>
                  <View style={{ flex: 1, borderRadius: 10, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 19 }}>{p.label}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          <View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -1.5, top: 0, bottom: 0, width: 3, backgroundColor: C.gold }} />
        </View>
        <Btn label={ready ? (busy ? 'Dönüyor…' : 'Ücretsiz Çevir') : `Yarın · ${fmtTime(midnight.getTime() - Date.now())}`} disabled={!ready || busy} onPress={spin} />
      </LinearGradient>

      <Text style={[st.h2, { marginTop: 18, marginBottom: 8 }]}>Güçlendirmeler</Text>
      <Item icon="box" title="Toplu Açma" desc="Aynı anda 10 / 25 / 50 kasa aç (hızlı modda)."
        action={g.massOpen ? 'Sahipsin ✓' : `Satın al · ${money(MASS_PRICE)}`} disabled={g.massOpen || g.balance < MASS_PRICE}
        onPress={() => { if (buyMass()) { play('coin'); say('Toplu Açma açıldı!'); } }} />
      <Item icon="bolt" title="Çift XP · 1 saat" desc={g.xpBoostUntil > Date.now() ? `Aktif: ${fmtTime(g.xpBoostUntil - Date.now())} kaldı` : 'Tüm XP kazancın 2 katı olur.'}
        action={`Satın al · ${money(BOOST_PRICE)}`} disabled={g.balance < BOOST_PRICE}
        onPress={() => { if (buyBoost()) { play('coin'); say('Çift XP başladı!'); } }} />
      <Text style={[st.dim, { marginTop: 14, textAlign: 'center' }]}>Mağaza sanal parayla çalışır. Gerçek para harcaması yoktur.</Text>
    </ScrollView>
  );
}

function Item(p: { icon: IconName; title: string; desc: string; action: string; disabled?: boolean; onPress: () => void }) {
  return (
    <View style={[st.card, { marginBottom: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 62, height: 62, borderRadius: 14, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Icon name={p.icon} size={32} color={C.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 19 }}>{p.title}</Text>
          <Text style={st.dim}>{p.desc}</Text>
        </View>
      </View>
      <Btn small label={p.action} disabled={p.disabled} onPress={p.onPress} style={{ marginTop: 10 }} />
    </View>
  );
}
