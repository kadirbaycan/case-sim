import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SELL_RATE, SKINS, TIER_COLOR, TIER_NAME, WEARS, itemName, itemPrice, wearIndex, Item } from '../engine/game';
import { useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { play } from '../sound';
import { Btn, C, Chip, ItemCard, money, s } from '../ui';

type Sort = 'new' | 'price' | 'rarity' | 'float';

export default function Inventory() {
  const inv = useGame((x) => x.inv);
  const sell = useGame((x) => x.sell);
  const prices = usePrices((x) => x.p);
  const [sort, setSort] = useState<Sort>('new');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Item | null>(null);

  const data = useMemo(() => {
    const a = [...inv];
    if (sort === 'price') a.sort((x, y) => itemPrice(y, prices).p - itemPrice(x, prices).p);
    if (sort === 'rarity') a.sort((x, y) => SKINS[y.skinId].t - SKINS[x.skinId].t || itemPrice(y, prices).p - itemPrice(x, prices).p);
    if (sort === 'float') a.sort((x, y) => x.float - y.float);
    return a;
  }, [inv, sort, prices]);

  const total = useMemo(() => inv.reduce((a, i) => a + itemPrice(i, prices).p, 0), [inv, prices]);
  const selVal = useMemo(() => inv.filter((i) => sel.has(i.uid)).reduce((a, i) => a + itemPrice(i, prices).p * SELL_RATE, 0), [inv, sel, prices]);

  const toggle = (uid: string) => setSel((p) => { const n = new Set(p); n.has(uid) ? n.delete(uid) : n.add(uid); return n; });
  const doSell = (uids: string[]) => { const g = sell(uids, prices); play('coin'); setSel(new Set()); setDetail(null); return g; };

  const sellCheap = (max: number) => {
    const ids = inv.filter((i) => itemPrice(i, prices).p < max).map((i) => i.uid);
    if (!ids.length) return Alert.alert('Satılacak eşya yok');
    Alert.alert(`${ids.length} eşya satılsın mı?`, `$${max}'den ucuz olanlar satılacak.`, [
      { text: 'Vazgeç' }, { text: 'Sat', onPress: () => doSell(ids) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 8 }}>
        <Text style={s.h2}>{inv.length} eşya · değer {money(total)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['new', 'price', 'rarity', 'float'] as Sort[]).map((k) => (
            <Chip key={k} on={sort === k} onPress={() => setSort(k)} label={{ new: 'Yeni', price: 'Fiyat', rarity: 'Nadirlik', float: 'Float' }[k]} />
          ))}
          <Chip on={false} label="<$1 sat" onPress={() => sellCheap(1)} />
          <Chip on={false} label="<$5 sat" onPress={() => sellCheap(5)} />
        </View>
        {sel.size > 0 && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Btn style={{ flex: 1 }} small color={C.green} label={`${sel.size} sat · ${money(selVal)}`} onPress={() => doSell([...sel])} />
            <Btn small color={C.card2} label="İptal" onPress={() => setSel(new Set())} />
          </View>
        )}
        <Text style={[s.p, { marginTop: 4 }]}>Çoklu seçim için eşyaya uzun bas. Satış komisyonu %{Math.round((1 - SELL_RATE) * 100)}.</Text>
      </View>
      <FlatList
        data={data} numColumns={2} keyExtractor={(i) => i.uid} contentContainerStyle={{ padding: 4 }}
        ListEmptyComponent={<Text style={[s.p, { textAlign: 'center', marginTop: 40 }]}>Envanter boş. Kasa aç!</Text>}
        renderItem={({ item }) => (
          <ItemCard
            item={item} prices={prices} selected={sel.has(item.uid)}
            onPress={() => (sel.size ? toggle(item.uid) : setDetail(item))}
            onLongPress={() => toggle(item.uid)}
          />
        )}
      />
      <Detail item={detail} onClose={() => setDetail(null)} onSell={(u) => doSell([u])} />
    </View>
  );
}

function Detail({ item, onClose, onSell }: { item: Item | null; onClose: () => void; onSell: (u: string) => void }) {
  const prices = usePrices((x) => x.p);
  if (!item) return null;
  const sk = SKINS[item.skinId];
  const pr = itemPrice(item, prices);
  const wi = wearIndex(item.float);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000c', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, borderTopWidth: 3, borderColor: TIER_COLOR[sk.t] }}>
          <Image source={{ uri: sk.img }} style={{ width: '100%', height: 150 }} contentFit="contain" />
          <Text style={[s.h1, { textAlign: 'center' }]}>{itemName(item)}</Text>
          <Text style={{ color: TIER_COLOR[sk.t], textAlign: 'center', marginBottom: 8 }}>{TIER_NAME[sk.t]}</Text>
          {!sk.v && (
            <>
              <View style={{ height: 8, backgroundColor: C.card2, borderRadius: 4, marginVertical: 6 }}>
                <View style={{ position: 'absolute', left: `${Math.min(99, item.float * 100)}%`, top: -3, width: 4, height: 14, backgroundColor: C.gold }} />
              </View>
              <Text style={s.p}>{WEARS[wi].name} · Float {item.float.toFixed(6)}</Text>
            </>
          )}
          <Text style={s.p}>Desen #{item.seed}{item.mult !== 1 ? ` · değer çarpanı x${item.mult}` : ''}</Text>
          <Text style={{ color: C.green, fontSize: 22, fontWeight: '800', marginVertical: 8 }}>
            {pr.est ? '~' : ''}{money(pr.p)} {pr.est && <Text style={{ fontSize: 11, color: C.dim }}>(tahmini, fiyat verisi yok)</Text>}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn style={{ flex: 1 }} color={C.green} label={`Sat ${money(pr.p * SELL_RATE)}`} onPress={() => onSell(item.uid)} />
            <Btn style={{ flex: 1 }} color={C.card2} label="Kapat" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
