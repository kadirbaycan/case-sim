import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Item, SELL_RATE, SKINS, TIER_COLOR, TIER_NAME, WEARS, itemName, itemPrice, wearIndex } from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { useNav } from '../nav';
import { play } from '../sound';
import { Btn, C, Chip, ItemTile, Sheet, Text, money, st } from '../ui';

const W = Dimensions.get('window').width;
type Sort = 'value' | 'rarity' | 'float' | 'az' | 'new';

export default function Inventory() {
  const inv = useGame((x) => x.inv);
  const sell = useGame((x) => x.sell);
  const prices = usePrices((x) => x.p);
  const setTab = useNav((n) => n.setTab);
  const sendToUpgrader = useNav((n) => n.sendToUpgrader);
  const [sort, setSort] = useState<Sort>('new');
  const [q, setQ] = useState('');
  const [cols, setCols] = useState(3);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Item | null>(null);

  const data = useMemo(() => {
    let a = inv.filter((i) => !q || itemName(i).toLowerCase().includes(q.toLowerCase()));
    if (sort === 'value') a = [...a].sort((x, y) => itemPrice(y, prices).p - itemPrice(x, prices).p);
    if (sort === 'rarity') a = [...a].sort((x, y) => SKINS[y.skinId].t - SKINS[x.skinId].t || itemPrice(y, prices).p - itemPrice(x, prices).p);
    if (sort === 'float') a = [...a].sort((x, y) => x.float - y.float);
    if (sort === 'az') a = [...a].sort((x, y) => SKINS[x.skinId].n.localeCompare(SKINS[y.skinId].n));
    return a;
  }, [inv, sort, prices, q]);

  const total = useMemo(() => inv.reduce((a, i) => a + itemPrice(i, prices).p, 0), [inv, prices]);
  const selVal = useMemo(() => inv.filter((i) => sel.has(i.uid)).reduce((a, i) => a + itemPrice(i, prices).p * SELL_RATE, 0), [inv, sel, prices]);
  const toggle = (u: string) => setSel((p) => { const n = new Set(p); n.has(u) ? n.delete(u) : n.add(u); return n; });
  const doSell = (u: string[]) => { sell(u, prices); play('coin'); setSel(new Set()); setDetail(null); };
  const sellBelow = (max: number) => {
    const ids = inv.filter((i) => itemPrice(i, prices).p < max && SKINS[i.skinId].t < 4).map((i) => i.uid);
    if (!ids.length) return Alert.alert('Satılacak eşya yok');
    Alert.alert(`${ids.length} eşya satılsın mı?`, `$${max} altındakiler satılır (Covert+ hariç).`, [{ text: 'Vazgeç' }, { text: 'Sat', onPress: () => doSell(ids) }]);
  };

  const w = (W - 12) / cols;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput value={q} onChangeText={setQ} placeholder={`${inv.length} eşyada ara…`} placeholderTextColor={C.dim}
            style={{ flex: 1, backgroundColor: C.card, color: C.text, borderRadius: 12, paddingHorizontal: 14, height: 44, fontFamily: C.font, fontSize: 16 }} />
          <View style={{ marginLeft: 8, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
            <Text style={{ color: C.green, fontWeight: '700', fontSize: 18 }}>{money(total)}</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 6 }}>
          {([['new', 'Yeni'], ['value', 'Değer'], ['rarity', 'Nadirlik'], ['float', 'Float'], ['az', 'A-Z']] as [Sort, string][]).map(([k, l]) => (
            <Chip key={k} label={l} on={sort === k} onPress={() => setSort(k)} />
          ))}
          <Chip label="<$1 sat" onPress={() => sellBelow(1)} />
          <Chip label="<$5 sat" onPress={() => sellBelow(5)} />
          <Chip label={cols === 3 ? '▦' : '▥'} onPress={() => setCols(cols === 3 ? 2 : 3)} />
        </ScrollView>
        <Text style={[st.dim, { textAlign: 'center', marginBottom: 4 }]}>Sanal değer — gerçek paraya çevrilemez. Çoklu seçim için uzun bas.</Text>
      </View>
      <FlatList
        key={cols} data={data} numColumns={cols} keyExtractor={(i) => i.uid} contentContainerStyle={{ paddingHorizontal: 3, paddingBottom: 90 }}
        initialNumToRender={12} windowSize={7}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 46 }}>🎒</Text>
            <Text style={{ fontWeight: '700', fontSize: 20, marginTop: 8 }}>Envanter boş</Text>
            <Btn small label="Kasalara git" onPress={() => setTab('cases')} style={{ marginTop: 14 }} />
          </View>
        }
        renderItem={({ item }) => (
          <ItemTile item={item} prices={prices} w={w} selected={sel.has(item.uid)}
            onPress={() => (sel.size ? toggle(item.uid) : setDetail(item))} onLongPress={() => toggle(item.uid)} />
        )}
      />
      {sel.size > 0 && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', gap: 8 }}>
          <Btn style={{ flex: 1 }} kind="gold" label={`${sel.size} sat · ${money(selVal)}`} onPress={() => doSell([...sel])} />
          <Btn kind="ghost" label="İptal" onPress={() => setSel(new Set())} />
        </View>
      )}
      <Detail item={detail} onClose={() => setDetail(null)} onSell={(u) => doSell([u])} onUp={(u) => { setDetail(null); sendToUpgrader(u); }} />
    </View>
  );
}

function Detail({ item, onClose, onSell, onUp }: { item: Item | null; onClose: () => void; onSell: (u: string) => void; onUp: (u: string) => void }) {
  const prices = usePrices((x) => x.p);
  if (!item) return null;
  const sk = SKINS[item.skinId];
  const pr = itemPrice(item, prices);
  const wi = wearIndex(item.float);
  return (
    <Sheet visible onClose={onClose}>
      <Image source={{ uri: sk.img }} style={{ width: '100%', height: 150 }} contentFit="contain" />
      <Text style={[st.h1, { textAlign: 'center' }]}>{itemName(item)}</Text>
      <Text style={{ color: TIER_COLOR[sk.t], textAlign: 'center', fontWeight: '700', marginBottom: 8 }}>{TIER_NAME[sk.t]}</Text>
      {!sk.v && (
        <>
          <View style={{ height: 8, backgroundColor: C.card2, borderRadius: 4, marginVertical: 8 }}>
            <View style={{ position: 'absolute', left: `${Math.min(98, item.float * 100)}%`, top: -3, width: 4, height: 14, backgroundColor: C.gold }} />
          </View>
          <Text style={st.dim}>{WEARS[wi].name} · Float {item.float.toFixed(6)}</Text>
        </>
      )}
      <Text style={st.dim}>Desen #{item.seed}{item.mult !== 1 ? ` · değer çarpanı x${item.mult}` : ''}</Text>
      <Text style={{ color: C.green, fontSize: 28, fontWeight: '700', marginVertical: 8 }}>
        {pr.est ? '~' : ''}{money(pr.p)} {pr.est && <Text style={{ fontSize: 13, color: C.dim }}>(tahmini)</Text>}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn style={{ flex: 1 }} kind="gold" label={`Sat ${money(pr.p * SELL_RATE)}`} onPress={() => onSell(item.uid)} />
        <Btn style={{ flex: 1 }} kind="blue" label="Upgrade" icon="⚡" onPress={() => onUp(item.uid)} />
      </View>
    </Sheet>
  );
}
