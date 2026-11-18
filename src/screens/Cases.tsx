import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import {
  CASES, CaseDef, Item, Rng, SKINS, TIER_COLOR, TIER_NAME, casePrice, itemName, itemPrice, rollCase, tierWeights, WEARS, wearIndex,
} from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { play, winSfx, haptic } from '../sound';
import { Btn, C, Chip, ItemCard, money, s } from '../ui';

const W = Dimensions.get('window').width;
const IW = 118; // reel item genişliği
const WIN_IDX = 54;
const REEL_LEN = 64;

export default function Cases() {
  const [sel, setSel] = useState<CaseDef | null>(null);
  const [q, setQ] = useState('');
  const prices = usePrices((x) => x.p);
  const list = useMemo(() => CASES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())), [q]);
  if (sel) return <OpenCase c={sel} onBack={() => setSel(null)} />;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TextInput
        value={q} onChangeText={setQ} placeholder="Kasa ara..." placeholderTextColor={C.dim}
        style={{ margin: 8, padding: 10, backgroundColor: C.card, color: C.text, borderRadius: 10 }}
      />
      <FlatList
        data={list} numColumns={2} keyExtractor={(c) => c.id} contentContainerStyle={{ padding: 4 }}
        renderItem={({ item: c }) => (
          <Pressable onPress={() => setSel(c)} style={[s.card, { alignItems: 'center', paddingVertical: 10 }]}>
            <Image source={{ uri: c.img }} style={{ width: 110, height: 85 }} contentFit="contain" />
            <Text style={[s.nm, { textAlign: 'center', minHeight: 0, marginTop: 4 }]}>{c.name}</Text>
            <Text style={{ color: C.green, fontWeight: '800' }}>{money(casePrice(c, prices))}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function OpenCase({ c, onBack }: { c: CaseDef; onBack: () => void }) {
  const prices = usePrices((x) => x.p);
  const { balance, fast } = useGame();
  const open = useGame((x) => x.open);
  const setOpt = useGame((x) => x.setOpt);
  const seeds = useGame((x) => x.seeds);
  const cost = casePrice(c, prices);
  const [busy, setBusy] = useState(false);
  const [reel, setReel] = useState<string[] | null>(null);
  const [won, setWon] = useState<Item[] | null>(null);
  const [rareView, setRareView] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  const lastIdx = useRef(-1);

  const weights = tierWeights(c);
  const byTier = useMemo(() => {
    const m: Record<number, string[]> = {};
    for (const id of c.items) (m[SKINS[id].t] ||= []).push(id);
    return m;
  }, [c]);
  const rareNames = useMemo(() => [...new Set(c.rare.map((id) => SKINS[id].n))], [c]);

  const filler = () => {
    const rng = new Rng({ serverSeed: String(Math.random()), clientSeed: 'v', nonce: 0 }, Math.floor(Math.random() * 1e9));
    return rollCase(c, rng).skinId;
  };

  function run(count: number) {
    if (busy) return;
    const items = open(c.id, count, prices);
    if (!items) return;
    if (count > 1 || fast) {
      play('unlock');
      const top = items.reduce((a, b) => (SKINS[b.skinId].t > SKINS[a.skinId].t ? b : a));
      setTimeout(() => { play(winSfx(SKINS[top.skinId].t)); haptic('success'); }, 250);
      setWon(items);
      return;
    }
    const item = items[0];
    const ids = Array.from({ length: REEL_LEN }, filler);
    ids[WIN_IDX] = item.skinId;
    setReel(ids);
    setBusy(true);
    lastIdx.current = -1;
    const jitter = (Math.random() - 0.5) * (IW - 24);
    const target = -(WIN_IDX * IW + IW / 2 - (W - 16) / 2 + jitter);
    x.setValue(0);
    play('unlock');
    const id = x.addListener(({ value }) => {
      const i = Math.floor((-value + (W - 16) / 2) / IW);
      if (i !== lastIdx.current) { lastIdx.current = i; play('tick'); }
    });
    Animated.timing(x, { toValue: target, duration: 6800, easing: Easing.bezier(0.1, 0.75, 0.12, 1), useNativeDriver: true }).start(() => {
      x.removeListener(id);
      const t = SKINS[item.skinId].t;
      play(winSfx(t));
      haptic(t >= 4 ? 'heavy' : 'success');
      setBusy(false);
      setWon([item]);
    });
  }

  const closeWon = () => { setWon(null); setReel(null); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Pressable onPress={onBack} disabled={busy}><Text style={{ color: C.accent, fontSize: 16, padding: 6 }}>‹ Geri</Text></Pressable>
        <Text style={[s.h1, { flex: 1, textAlign: 'center', marginRight: 50 }]}>{c.name}</Text>
      </View>

      {/* Şerit */}
      <View style={{ height: 130, backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.line, marginBottom: 10 }}>
        {reel ? (
          <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }], height: 130, alignItems: 'center' }}>
            {reel.map((id, i) => (
              <View key={i} style={{ width: IW, height: 118, padding: 4 }}>
                <View style={{ flex: 1, backgroundColor: C.card2, borderRadius: 8, borderBottomWidth: 4, borderBottomColor: TIER_COLOR[SKINS[id].t], alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={{ uri: SKINS[id].img }} style={{ width: 96, height: 72 }} contentFit="contain" />
                </View>
              </View>
            ))}
          </Animated.View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={{ uri: c.img }} style={{ width: 150, height: 110 }} contentFit="contain" />
          </View>
        )}
        {reel && <View pointerEvents="none" style={{ position: 'absolute', left: (W - 16) / 2 - 1.5, top: 0, bottom: 0, width: 3, backgroundColor: C.gold }} />}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
        <Btn style={{ flex: 2 }} label={`Aç  ${money(cost)}`} disabled={busy || balance < cost} color={C.green} onPress={() => run(1)} />
        <Btn style={{ flex: 1 }} label="x5" disabled={busy || balance < cost * 5} color={C.accent} onPress={() => run(5)} />
        <Btn style={{ flex: 1 }} label="x10" disabled={busy || balance < cost * 10} color={C.accent} onPress={() => run(10)} />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Chip label={fast ? 'Animasyon: kapalı' : 'Animasyon: açık'} on={fast} onPress={() => setOpt('fast', !fast)} />
        <Text style={[s.p, { alignSelf: 'center' }]}>Kasa + anahtar ($2.49)</Text>
      </View>

      <Text style={s.h2}>Kasa İçeriği</Text>
      {[1, 2, 3, 4].map((t) => byTier[t] && (
        <View key={t} style={s.box}>
          <Text style={{ color: TIER_COLOR[t], fontWeight: '800', marginBottom: 4 }}>
            {TIER_NAME[t]} · %{(weights[t] * 100).toFixed(2)}
          </Text>
          {byTier[t].map((id) => (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
              <Image source={{ uri: SKINS[id].img }} style={{ width: 40, height: 30 }} contentFit="contain" />
              <Text style={{ color: C.text, fontSize: 12, marginLeft: 6, flex: 1 }}>{SKINS[id].n}</Text>
            </View>
          ))}
        </View>
      ))}
      {weights[5] && (
        <Pressable onPress={() => setRareView(true)} style={[s.box, { borderColor: C.gold }]}>
          <Text style={{ color: C.gold, fontWeight: '800' }}>★ Nadir Özel · %{(weights[5] * 100).toFixed(2)}  ({rareNames.length} çeşit) ›</Text>
          <Text style={s.p}>Bıçak / eldiven listesini gör</Text>
        </Pressable>
      )}
      <Text style={[s.p, { marginTop: 4 }]}>Adil-oyun sayacı (nonce): {seeds.nonce}</Text>

      <Modal visible={!!won} transparent animationType="fade" onRequestClose={closeWon}>
        <View style={{ flex: 1, backgroundColor: '#000d', justifyContent: 'center', padding: 12 }}>
          <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 10, maxHeight: '90%' }}>
            <Text style={[s.h1, { textAlign: 'center', marginBottom: 8 }]}>{won && won.length > 1 ? `${won.length} Eşya` : 'Çıkan Eşya'}</Text>
            <FlatList
              data={won || []} numColumns={won && won.length > 1 ? 2 : 1} key={won && won.length > 1 ? 'm' : 's'}
              keyExtractor={(i) => i.uid}
              renderItem={({ item }) => <ItemCard item={item} prices={prices} />}
            />
            {won && (
              <Text style={{ color: C.green, textAlign: 'center', fontWeight: '800', marginVertical: 8 }}>
                Toplam değer: {money(won.reduce((a, i) => a + itemPrice(i, prices).p, 0))}
              </Text>
            )}
            <Btn label="Envantere Ekle" onPress={closeWon} />
          </View>
        </View>
      </Modal>

      <Modal visible={rareView} transparent animationType="slide" onRequestClose={() => setRareView(false)}>
        <View style={{ flex: 1, backgroundColor: '#000c', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 12, maxHeight: '75%' }}>
            <Text style={[s.h1, { color: C.gold, marginBottom: 8 }]}>★ Nadir Özel Eşyalar</Text>
            <FlatList
              data={rareNames}
              keyExtractor={(n) => n}
              renderItem={({ item: n }) => {
                const id = c.rare.find((r) => SKINS[r].n === n)!;
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                    <Image source={{ uri: SKINS[id].img }} style={{ width: 50, height: 38 }} contentFit="contain" />
                    <Text style={{ color: C.text, marginLeft: 8, flex: 1, fontSize: 13 }}>{n}</Text>
                  </View>
                );
              }}
            />
            <Btn label="Kapat" onPress={() => setRareView(false)} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
