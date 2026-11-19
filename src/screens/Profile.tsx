import React, { useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CASES, levelFromXp } from '../engine/game';
import { seedHash, useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { Bar, Btn, C, Chip, Text, money, st } from '../ui';

const TITLES = [
  { name: 'Kasa Ustası', f: (s: any) => s.stats.opened, steps: [100, 500, 2000, 10000], unit: 'kasa' },
  { name: 'Whale', f: (s: any) => s.stats.spent, steps: [100, 1000, 10000, 100000], unit: '$' },
  { name: 'Altın Avcısı', f: (s: any) => s.stats.gold, steps: [1, 5, 20, 50], unit: '★' },
];
const RANK = ['Çaylak', 'Bronz', 'Gümüş', 'Altın', 'Efsane'];

export default function Profile() {
  const g = useGame();
  const pr = usePrices();
  const lv = levelFromXp(g.xp);
  const [cs, setCs] = useState(g.seeds.clientSeed);
  const age = pr.updated ? Math.round((Date.now() - pr.updated) / 3600000) : null;
  const st_ = g.stats;
  const done = CASES.filter((c) => (g.perCase[c.id] || 0) > 0).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <LinearGradient colors={['#2b3347', '#171b25']} style={{ borderRadius: 18, padding: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 76, fontWeight: '700', lineHeight: 84 }}>{lv.level}</Text>
        <Text style={{ color: C.dim, fontWeight: '700', letterSpacing: 2 }}>SEVİYE</Text>
        <Bar v={lv.cur / lv.need} h={14} style={{ alignSelf: 'stretch', marginTop: 10 }} color={C.blue} />
        <Text style={{ color: C.dim, marginTop: 4 }}>{lv.cur.toLocaleString()} / {lv.need.toLocaleString()} XP</Text>
      </LinearGradient>

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Ömür boyu toplamlar</Text>
      <View style={st.card}>
        <Row l="Toplam kazanç" v={money(st_.earned)} />
        <Row l="Toplam harcama" v={money(st_.spent)} />
        <Row l="Açılan kasa" v={String(st_.opened)} />
        <Row l="Altın (★) çıkan" v={String(st_.gold)} />
        <Row l="En değerli drop" v={st_.bestName ? `${st_.bestName} (${money(st_.best)})` : '-'} />
        <Row l="Upgrader" v={`${st_.upWins}K / ${st_.upLoss}Y`} />
        <Row l="Takas / Coinflip" v={`${st_.trades} / ${st_.flipWins}-${st_.flips - st_.flipWins}`} last />
      </View>

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Ünvanlar</Text>
      {TITLES.map((t) => {
        const val = t.f(g);
        let r = 0; while (r < t.steps.length && val >= t.steps[r]) r++;
        const next = t.steps[Math.min(r, t.steps.length - 1)];
        return (
          <View key={t.name} style={[st.card, { marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', fontSize: 18 }}>{t.name}</Text>
              <Text style={{ color: C.gold, fontWeight: '700' }}>{RANK[r]}</Text>
            </View>
            <Bar v={r >= t.steps.length ? 1 : val / next} h={8} style={{ marginTop: 6 }} color={C.gold} />
            <Text style={[st.dim, { textAlign: 'right' }]}>{Math.floor(val)} / {next} {t.unit}</Text>
          </View>
        );
      })}

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Kasa koleksiyonu · {done} / {CASES.length}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {CASES.map((c) => {
          const n = g.perCase[c.id] || 0;
          return (
            <View key={c.id} style={{ width: '25%', padding: 3 }}>
              <View style={{ backgroundColor: C.card, borderRadius: 10, padding: 4, alignItems: 'center', opacity: n ? 1 : 0.35 }}>
                <Image source={{ uri: c.img }} style={{ width: '100%', height: 50 }} contentFit="contain" />
                <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '700' }}>{c.name.replace(' Case', '')}</Text>
                <Text style={{ color: n ? C.green : C.dim, fontSize: 12, fontWeight: '700' }}>{n}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Adil-Oyun</Text>
      <View style={st.card}>
        <Text style={st.dim}>Sunucu tohumu hash'i (SHA-256):</Text>
        <Text selectable style={{ fontSize: 12 }}>{seedHash(g.seeds)}</Text>
        <Text style={[st.dim, { marginTop: 6 }]}>İstemci tohumu:</Text>
        <TextInput value={cs} onChangeText={setCs} onBlur={() => g.setClientSeed(cs)} style={{ backgroundColor: C.card2, color: C.text, borderRadius: 8, padding: 8, fontFamily: C.font }} />
        <Text style={[st.dim, { marginTop: 6 }]}>Nonce: {g.seeds.nonce}</Text>
        {g.seeds.lastRevealed && <><Text style={[st.dim, { marginTop: 6 }]}>Önceki sunucu tohumu:</Text><Text selectable style={{ fontSize: 12 }}>{g.seeds.lastRevealed}</Text></>}
        <Text style={[st.dim, { marginTop: 6 }]}>Sonuç = HMAC-SHA256(sunucu, "istemci:nonce:sayaç"). Tohumu yenileyince eskisi açıklanır, açılışları doğrulayabilirsin.</Text>
        <Btn small kind="ghost" label="Tohumu yenile" onPress={() => g.rotateSeed()} style={{ marginTop: 8 }} />
      </View>

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Fiyatlar</Text>
      <View style={st.card}>
        <Text style={st.dim}>{pr.count > 0 ? `${pr.count} gerçek piyasa fiyatı (Skinport) · ${age === 0 ? '<1' : age} saat önce` : 'Fiyat verisi yok: tahmini fiyat (~) kullanılıyor.'}</Text>
        <Btn small label={pr.loading ? 'Yükleniyor…' : 'Fiyatları yenile'} disabled={pr.loading} style={{ marginTop: 8 }}
          onPress={async () => { const ok = await pr.refresh(); Alert.alert(ok ? 'Güncellendi' : 'Güncellenemedi'); }} />
      </View>

      <Text style={[st.h2, { marginTop: 16, marginBottom: 6 }]}>Ayarlar</Text>
      <View style={[st.card, { flexDirection: 'row' }]}>
        <Chip label={g.sfx ? 'Ses/Titreşim: açık' : 'Ses/Titreşim: kapalı'} on={g.sfx} onPress={() => g.setOpt('sfx', !g.sfx)} />
      </View>
      <Btn small kind="danger" label="Oyunu sıfırla" style={{ marginTop: 12 }}
        onPress={() => Alert.alert('Her şey silinsin mi?', '', [{ text: 'Vazgeç' }, { text: 'Sıfırla', style: 'destructive', onPress: () => g.reset() }])} />
      <Text style={[st.dim, { textAlign: 'center', marginTop: 16 }]}>
        Sanal para ile oynanan simülatör. Gerçek para / gerçek skin kazancı yoktur. Valve Corporation ile bağlantılı değildir. Counter-Strike ve skin görselleri Valve'ın tescilli markalarıdır.
      </Text>
    </ScrollView>
  );
}

function Row({ l, v, last }: { l: string; v: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: last ? 0 : 1, borderColor: C.line }}>
      <Text style={{ color: C.dim, fontSize: 16 }}>{l}</Text>
      <Text style={{ fontWeight: '700', fontSize: 16, flexShrink: 1, textAlign: 'right', marginLeft: 10 }}>{v}</Text>
    </View>
  );
}
