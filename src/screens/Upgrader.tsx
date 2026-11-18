import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SKINS, TIER_COLOR, WEARS, basePrice, itemPrice, upgradeChance, Item } from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { play, winSfx, haptic } from '../sound';
import { Btn, C, Chip, ItemCard, money, s } from '../ui';

const MULTS = [1.5, 2, 3, 5, 10, 25, 50];
type Cand = { id: string; float: number; price: number; wear: number };

export default function Upgrader() {
  const inv = useGame((x) => x.inv);
  const upgrade = useGame((x) => x.upgrade);
  const prices = usePrices((x) => x.p);
  const [inp, setInp] = useState<Item | null>(null);
  const [pick, setPick] = useState(false);
  const [mult, setMult] = useState(2);
  const [target, setTarget] = useState<Cand | null>(null);
  const [res, setRes] = useState<{ win: boolean; chance: number; item?: Item } | null>(null);
  const [busy, setBusy] = useState(false);
  const pos = useRef(new Animated.Value(0)).current;
  const [endPos, setEndPos] = useState<number | null>(null);

  const value = inp ? itemPrice(inp, prices).p : 0;

  const cands = useMemo<Cand[]>(() => {
    if (!inp) return [];
    const want = value * mult;
    const out: Cand[] = [];
    for (const [id, sk] of Object.entries(SKINS)) {
      if (sk.t < 3) continue;
      for (let w = 0; w < 5; w++) {
        const wlo = w === 0 ? 0 : WEARS[w - 1].max;
        const lo = Math.max(wlo, sk.min), hi = Math.min(WEARS[w].max, sk.max);
        if (!sk.v && lo >= hi) continue;
        if (sk.v && w > 0) continue;
        const float = sk.v ? 0 : (lo + hi) / 2;
        const p = basePrice(sk, float, false, prices);
        if (p.est) continue; // yalnızca gerçek fiyatı olanlar
        if (p.p > want * 0.75 && p.p < want * 1.3) out.push({ id, float, price: p.p, wear: w });
      }
    }
    return out.sort((a, b) => Math.abs(a.price - want) - Math.abs(b.price - want)).slice(0, 25);
  }, [inp, mult, prices, value]);

  const chance = target ? upgradeChance(value, target.price) : 0;

  const go = () => {
    if (!inp || !target || busy) return;
    const r = upgrade(inp.uid, target.id, target.float, prices);
    if (!r) return;
    setBusy(true);
    setRes(null);
    pos.setValue(0);
    const final = r.win ? Math.random() * r.chance * 0.96 + 0.01 : r.chance + (1 - r.chance) * (0.04 + Math.random() * 0.92);
    setEndPos(final);
    play('unlock');
    Animated.sequence([
      Animated.timing(pos, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(pos, { toValue: 0.05, duration: 600, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(pos, { toValue: final, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      setBusy(false);
      setRes(r);
      if (r.win && r.item) { play(winSfx(SKINS[r.item.skinId].t)); haptic('success'); }
      else { play('lose'); haptic('heavy'); }
      setInp(null);
      setTarget(null);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 8 }}>
      <Text style={s.h2}>1) Yükseltilecek eşya</Text>
      {inp ? (
        <View style={{ flexDirection: 'row' }}>
          <ItemCard item={inp} prices={prices} />
          <View style={{ flex: 1, padding: 6, justifyContent: 'center' }}>
            <Btn small color={C.card2} label="Değiştir" disabled={busy} onPress={() => setPick(true)} />
          </View>
        </View>
      ) : (
        <Btn label="Envanterden seç" onPress={() => setPick(true)} />
      )}

      {inp && (
        <>
          <Text style={[s.h2, { marginTop: 10 }]}>2) Hedef çarpanı</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {MULTS.map((m) => <Chip key={m} label={`x${m}`} on={mult === m} onPress={() => { setMult(m); setTarget(null); }} />)}
          </View>
          <FlatList
            data={cands} keyExtractor={(c) => c.id + c.wear} style={{ marginTop: 6 }}
            ListEmptyComponent={<Text style={s.p}>Bu çarpan için gerçek fiyatlı hedef bulunamadı (fiyat verisi henüz yüklenmemiş olabilir).</Text>}
            renderItem={({ item: c }) => {
              const sk = SKINS[c.id];
              const on = target?.id === c.id && target.wear === c.wear;
              return (
                <Pressable onPress={() => setTarget(c)} style={[s.box, { flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 6, borderColor: on ? C.accent : TIER_COLOR[sk.t] }]}>
                  <Image source={{ uri: sk.img }} style={{ width: 60, height: 44 }} contentFit="contain" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{sk.n}</Text>
                    <Text style={s.sm}>{sk.v ? '' : WEARS[c.wear].name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.green, fontWeight: '800' }}>{money(c.price)}</Text>
                    <Text style={s.sm}>%{(upgradeChance(value, c.price) * 100).toFixed(1)}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      )}

      {inp && target && (
        <View style={{ paddingTop: 8 }}>
          <View style={{ height: 22, backgroundColor: C.red + '55', borderRadius: 11, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${chance * 100}%`, backgroundColor: C.green }} />
            <Animated.View
              style={{ position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: '#fff', left: pos.interpolate({ inputRange: [0, 1], outputRange: ['0%', '99%'] }) }}
            />
          </View>
          <Text style={[s.p, { textAlign: 'center', marginVertical: 4 }]}>Kazanma şansı %{(chance * 100).toFixed(2)} (ev payı %5)</Text>
          <Btn label={busy ? 'Dönüyor...' : 'YÜKSELT'} disabled={busy} color={C.gold} onPress={go} />
        </View>
      )}

      <Picker visible={pick} onClose={() => setPick(false)} onPick={(i) => { setInp(i); setTarget(null); setPick(false); }} />

      <Modal visible={!!res} transparent animationType="fade" onRequestClose={() => setRes(null)}>
        <View style={{ flex: 1, backgroundColor: '#000d', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 14 }}>
            <Text style={[s.h1, { textAlign: 'center', color: res?.win ? C.green : C.red }]}>{res?.win ? 'KAZANDIN!' : 'Kaybettin'}</Text>
            {res?.item && <ItemCard item={res.item} prices={prices} />}
            {res && !res.win && <Text style={[s.p, { textAlign: 'center', marginVertical: 12 }]}>Eşya yandı. Şans %{(res.chance * 100).toFixed(1)} idi.</Text>}
            <Btn label="Tamam" onPress={() => setRes(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Picker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (i: Item) => void }) {
  const inv = useGame((x) => x.inv);
  const prices = usePrices((x) => x.p);
  const data = useMemo(() => [...inv].sort((a, b) => itemPrice(b, prices).p - itemPrice(a, prices).p), [inv, prices]);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 8 }}>
        <Text style={s.h1}>Eşya seç</Text>
        <FlatList data={data} numColumns={2} keyExtractor={(i) => i.uid} renderItem={({ item }) => <ItemCard item={item} prices={prices} onPress={() => onPick(item)} />} />
        <Btn label="Kapat" color={C.card2} onPress={onClose} />
      </View>
    </Modal>
  );
}
