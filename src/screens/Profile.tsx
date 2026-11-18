import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { levelFromXp } from '../engine/game';
import { CLICK_UPGRADES, clickCost, seedHash, useGame } from '../store/game';
import { usePrices } from '../store/prices';
import { play, haptic } from '../sound';
import { Btn, C, Chip, money, s } from '../ui';

export default function Profile() {
  const g = useGame();
  const pr = usePrices();
  const lv = levelFromXp(g.xp);
  const [cs, setCs] = useState(g.seeds.clientSeed);
  const [offline, setOffline] = useState(0);

  useEffect(() => { const x = g.collectAuto(); if (x > 0) setOffline(x); }, []);
  useEffect(() => {
    if (!g.click.auto) return;
    const t = setInterval(() => g.collectAuto(), 1000);
    return () => clearInterval(t);
  }, [g.click.auto]);

  const age = pr.updated ? Math.round((Date.now() - pr.updated) / 3600000) : null;
  const st = g.stats;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 10 }}>
      <View style={s.box}>
        <Text style={s.h1}>Seviye {lv.level}{lv.level >= 100 ? ' · MAX' : ''}</Text>
        <View style={{ height: 8, backgroundColor: C.card2, borderRadius: 4, marginVertical: 6 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: C.accent, width: `${Math.min(100, (lv.cur / lv.need) * 100)}%` }} />
        </View>
        <Text style={s.p}>{lv.cur}/{lv.need} XP · Takas Kontratı Sv.3, Upgrader Sv.5'te açılır</Text>
      </View>

      <View style={s.box}>
        <Text style={s.h2}>İstatistikler</Text>
        <Text style={s.p}>Açılan kasa: {st.opened} · Harcanan: {money(st.spent)} · Satıştan: {money(st.earned)}</Text>
        <Text style={s.p}>Altın (★) çıkan: {st.gold} · Upgrader {st.upWins}W/{st.upLoss}L · Takas: {st.trades}</Text>
        <Text style={s.p}>En değerli drop: {st.bestName ? `${st.bestName} (${money(st.best)})` : '-'}</Text>
      </View>

      <View style={s.box}>
        <Text style={s.h2}>Tıklayıcı (para bitince)</Text>
        {offline > 0 && <Text style={{ color: C.green }}>Çevrimdışı kazanç: +{money(offline)}</Text>}
        <Pressable
          onPress={() => { g.tap(); play('coin'); haptic('light'); }}
          style={({ pressed }) => ({ backgroundColor: pressed ? '#2a7d3f' : C.green, borderRadius: 14, paddingVertical: 26, alignItems: 'center', marginVertical: 8 })}
        >
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#000' }}>TIKLA +{money(0.01 * (1 + g.click.tap))}</Text>
        </Pressable>
        {CLICK_UPGRADES.map((u) => {
          const lvl = g.click[u.id as 'tap' | 'auto'];
          const cost = clickCost(u.id as 'tap' | 'auto', lvl);
          return (
            <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '700' }}>{u.name} · Sv.{lvl}</Text>
                <Text style={s.sm}>{u.desc}</Text>
              </View>
              <Btn small label={money(cost)} disabled={g.balance < cost} onPress={() => g.buyClick(u.id as 'tap' | 'auto')} />
            </View>
          );
        })}
      </View>

      <View style={s.box}>
        <Text style={s.h2}>Adil-Oyun (Provably Fair)</Text>
        <Text style={s.sm}>Sunucu tohumu hash'i (SHA-256):</Text>
        <Text selectable style={{ color: C.text, fontSize: 11 }}>{seedHash(g.seeds)}</Text>
        <Text style={[s.sm, { marginTop: 6 }]}>İstemci tohumu:</Text>
        <TextInput value={cs} onChangeText={setCs} onBlur={() => g.setClientSeed(cs)} style={{ backgroundColor: C.card2, color: C.text, borderRadius: 8, padding: 8 }} />
        <Text style={[s.sm, { marginTop: 6 }]}>Nonce: {g.seeds.nonce}</Text>
        {g.seeds.lastRevealed && (
          <>
            <Text style={[s.sm, { marginTop: 6 }]}>Önceki sunucu tohumu (açıklandı):</Text>
            <Text selectable style={{ color: C.text, fontSize: 11 }}>{g.seeds.lastRevealed}</Text>
          </>
        )}
        <Text style={[s.sm, { marginTop: 6 }]}>
          Sonuç = HMAC-SHA256(sunucu, "istemci:nonce:sayaç"). Tohumu yenileyince eskisi açıklanır, eski açılışları kendin doğrulayabilirsin. Bu sürümde tohumlar cihazda üretilir.
        </Text>
        <Btn small color={C.card2} label="Tohumu Yenile" onPress={() => g.rotateSeed()} style={{ marginTop: 8 }} />
      </View>

      <View style={s.box}>
        <Text style={s.h2}>Fiyatlar</Text>
        <Text style={s.p}>
          {pr.count > 0 ? `${pr.count} gerçek piyasa fiyatı (Skinport) · ${age === 0 ? '<1' : age} saat önce` : 'Fiyat verisi yüklenmemiş: eşyalar tahmini fiyatla gösterilir (~).'}
        </Text>
        <Btn small label={pr.loading ? 'Yükleniyor...' : 'Fiyatları yenile'} disabled={pr.loading} onPress={async () => { const ok = await pr.refresh(); Alert.alert(ok ? 'Güncellendi' : 'Güncellenemedi', ok ? '' : 'İnternet ya da fiyat adresi yok.'); }} style={{ marginTop: 6 }} />
      </View>

      <View style={s.box}>
        <Text style={s.h2}>Ayarlar</Text>
        <View style={{ flexDirection: 'row' }}>
          <Chip label={g.sfx ? 'Ses/Titreşim: açık' : 'Ses/Titreşim: kapalı'} on={g.sfx} onPress={() => g.setOpt('sfx', !g.sfx)} />
        </View>
        <Btn small color={C.red} label="Oyunu sıfırla" style={{ marginTop: 10 }} onPress={() => Alert.alert('Her şey silinsin mi?', '', [{ text: 'Vazgeç' }, { text: 'Sıfırla', style: 'destructive', onPress: () => g.reset() }])} />
      </View>

      <Text style={[s.sm, { textAlign: 'center', marginVertical: 10 }]}>
        Sanal para ile oynanan simülatör. Gerçek para / gerçek skin kazancı yoktur. Valve Corporation ile bağlantılı değildir. Counter-Strike ve skin görselleri Valve'ın tescilli markalarıdır.
      </Text>
    </ScrollView>
  );
}
