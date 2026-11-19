# DEPO — Tasarım ve Üretim Planı (v3)

> Bu belge, referans uygulamalardan bağımsız, bu oyun için sıfırdan tasarlanmış bir plandır.
> Önceki planın (v2) yerine geçer. Her bölüm "neden" + "nasıl" + "kabul ölçütü" içerir.

---

## 0. Önce gerçek veri: ekonomi sorunu

Mevcut 42 kasanın gerçek Skinport fiyatlarıyla hesapladığım **beklenen geri dönüş (RTP)**, satış komisyonu %10 düşüldükten sonra:

| Ölçü | Değer |
|---|---|
| Ortalama RTP (42 kasa) | **%43** |
| En kötü | Kilowatt %22, Revolution %23, Fracture %26, Recoil %26, Clutch %27 |
| En iyi | CS:GO Weapon Case 3 %84, eSports 2013 Winter %64, Vanguard %59 |
| En ucuz kasa+anahtar | $2.68 (anahtar $2.49 fiyatın %93'ü) |
| En pahalı | $92 (CS:GO Weapon Case) |

**Anlamı:** $50 ile ucuz kasa açan oyuncu 18 kasada yaklaşık $21'e düşer. Gerçekçilik güzel, ama **ekonomi tek başına oyunu 10 dakikada bitirir.** Bu planın en önemli tasarım problemi budur; birçok karar buradan türüyor (Bölüm 7).

Çözüm ilkeleri:
1. Gerçekçiliği bozma: fiyatlar, oranlar, float aynı kalır.
2. Kaybı yavaşlat: oyuncuya sürekli, anlamlı **gelir kaynakları** ver (depo ekibi, siparişler, piyasa).
3. Kaybetmeyi bile eğlenceli yap: "Koleksiyon Albümü" ve "Kasa Karnesi" sayesinde kötü şans da ilerleme/hikâye olur.

---

## 1. Vizyon ve tasarım sütunları

**Tek cümle:** Gece vardiyasında bir kargo deposunu yöneten, kasaları açıp piyasayı okuyarak büyüyen, gerçek fiyatlı bir CS2 kasa ve piyasa oyunu.

**Dört sütun**

| Sütun | Anlamı | Ürün kararına etkisi |
|---|---|---|
| **Tören** | Kasa açmak bir ritüel; gerilim ve boşalma | Açılış koreografisi, ses/titreşim tasarımı |
| **Piyasa Sezgisi** | Gerçek fiyatlar her kararı anlamlı yapar | Piyasa sekmesi, fiyat grafiği, siparişler |
| **Koleksiyon** | Her çıkan şeyin bir yeri var | Albüm, vitrin, ilerleme |
| **Saygı** | Oyuncunun zamanına ve parasına (sanal bile olsa) saygı | Şeffaf oranlar, atlanabilir animasyon, mola hatırlatıcı |

**Hedef oyuncu ve oturum tipleri (telefon, çoğunlukla tek el)**

| Oturum | Süre | Ne yapar |
|---|---|---|
| Mikro | 20–40 sn | Depoyu açar, vardiya gelirini toplar, supply drop alır |
| Kısa | 3–5 dk | 3–6 kasa açar, bir siparişi tamamlar, görevi bitirir |
| Uzun | 20–40 dk | Piyasayı okur, kasa biriktirir, takas/upgrade dener, albüm doldurur |

Tasarım kuralı: **her oturum tipi, uygulamayı açtıktan sonra 3 saniye içinde yapılacak bir şey bulmalı.**

---

## 2. Kimlik

### 2.1 Ad ve ton
- Çalışma adı **DEPO** (alt başlık: *Kasa Atölyesi*). Marka içinde "CS", "Counter-Strike", "Valve", "CS2" geçmez (mağaza metninde "CS2 skin'lerinden esinlenen" yerine "kasa simülatörü" denir; Valve ilişkisi olmadığı belirtilir).
- Ton: kuru, hafif ironik depo iş jargonu. Örnek mikro metinler:
  - Boş envanter: "Raflar boş. Birisi kasa getirsin."
  - Para bitti: "Kasada bozuk para bile yok. Vardiyaya devam."
  - Büyük kayıp: "Piyasa acımasız. Defterine not düştüm."
  - Altın çıkınca: "Bunu kimse görmedi. Belki de herkes gördü."
- Anlatı: Sen yeni depo sorumlususun; kasalar gelir, bayiler sipariş verir, piyasa dalgalanır. Hikâye zorunlu değil, **tat verir**.

### 2.2 Görsel dil: "Endüstriyel gece vardiyası"
Referanslardaki yeşil/zeytin düğme dilinden bilinçli olarak ayrışır.

**Renk token'ları**

| Token | Hex | Kullanım |
|---|---|---|
| `bg.0` | `#090C11` | Uygulama zemini |
| `bg.1` | `#10151D` | Kart |
| `bg.2` | `#18202B` | Yükseltilmiş kart, input |
| `line` | `#263243` | İnce çizgi |
| `text.0` | `#F1F4F9` | Ana yazı |
| `text.1` | `#98A3B5` | İkincil yazı |
| `accent` | `#FFB02E` | **Ana eylem** (sodyum lambası amber) |
| `info` | `#35D0C0` | Piyasa, bilgi, grafik |
| `gain` | `#5BE3A1` | Kâr, artış |
| `loss` | `#FF6B6B` | Zarar, düşüş |
| `rare.*` | CS2 nadirlik renkleri | Yalnızca nadirlik göstergesi |

Kurallar: amber yalnız birincil eylem ve "önemli" için; yeşil yalnız para artışı; nadirlik renkleri başka amaçla kullanılmaz.

**Yazı tipleri:** başlık *Barlow Condensed* (yoğun, stencil hissi), gövde *Barlow*, sayılar *IBM Plex Mono* (tabular rakam, fiyat sütunları hizalı). Ölçek: 12 / 14 / 16 / 20 / 28 / 40 / 64 (modüler 1.25). Başlıklar BÜYÜK HARF, harf aralığı +4%.

**Boşluk:** 4px ızgara. Kenar boşluğu 16, kart içi 12, kart arası 8. **Köşe:** 10 (chip), 14 (kart), 20 (sheet). **Yükseklik:** gölge yok; yüzeyler renk farkı + 1px çizgi ile ayrılır.

**İkonlar:** emoji yok. Tek ağırlıkta (1.75px) çizgi ikon seti (Lucide benzeri, `react-native-svg`). Kasa/anahtar/etiket/forklift gibi 12 özel ikon çizilir.

**Doku:** zemin çok hafif (opaklık %3) sac perforasyon deseni; kartlarda köşe vidası detayı (sadece başlık kartlarında). Aşırı süs yok.

### 2.3 Hareket dili
| Token | Süre | Eğri | Kullanım |
|---|---|---|---|
| `tap` | 90 ms | ease-out | Basış ölçek 0.97 |
| `enter` | 220 ms | cubic-out | Ekran/sheet girişi |
| `exit` | 160 ms | cubic-in | Çıkış |
| `count` | 600 ms | ease-out | Sayı sayma (bakiye, XP) |
| `reveal` | 350–1400 ms | özel | Nadirlik ortaya çıkışı |
Kural: hareket **bilgi taşır** (para yeşil yukarı akar, kayıp kırmızı kısa titrer); sürekli dönen süs animasyonu yok. "Hareketi azalt" ayarı hepsini kısaltır.

### 2.4 Ses dili
Kaynak: şu an sentezlenmiş sesler var; hedef: kısa, kuru, endüstriyel (metal kilit, plastik çatırtı, fan, kasa kapağı).
- Katmanlar: **tık** (şerit geçişi, pitch artan), **kilit** (başlangıç), **bas darbe** (duruş), **melodi** (nadirliğe göre).
- Nadirlik melodisi: Mavi = tek nota, Mor = iki nota, Pembe = üçlü arpej, Kırmızı = dörtlü arpej + sub-bas, Altın = tam akor + kısa sessizlik + parıltı.
- Müzik yok (varsayılan); isteğe bağlı çok düşük "depo uğultusu" ortam sesi.
- Ayrı ses/titreşim anahtarları, varsayılan açık.

---

## 3. Bilgi mimarisi

### 3.1 Beş sekme

| Sekme | Rolü | İçerik |
|---|---|---|
| **DEPO** | Ana merkez, "şimdi ne yapmalı?" | Akıllı öneri, vardiya geliri, siparişler, supply, seri, günlük hedefler, piyasa nabzı |
| **KASALAR** | Açma sahası | Kasa raf listesi, kasa detay, açılış, sonuç |
| **KASAM** | Sahip olduğun her şey | Envanter, mühürlü kasalar (depo stoku), Albüm, Vitrin |
| **PİYASA** | Fiyat zekâsı | Piyasa nabzı, kasa borsası, grafikler, uyarılar, bayi siparişleri |
| **ATÖLYE** | Dönüştürme ve riskli oyunlar | Upgrade, Takas Kontratı, Coinflip, (sonra) Case Battle |

Profil, ayarlar, sezon ve ünvanlar: üst bardaki **kimlik rozeti** ile açılan tam ekran sayfa. (Referanslardan farkı: Sezon/görevler ayrı sekme değil, **Depo** ana sayfasının bir parçası ve profilde detay.)

### 3.2 Üst durum çubuğu (her yerde, 56px)
```
[‹]  (Sv 12 halka)  DEPO ADI           ⛁ $1,284.50 ▲+3.20
```
- Sol: geri (gerekirse) + seviye halkası (XP dolum halka, dokun → Profil).
- Orta: ekran başlığı (Depo'da vardiya adı).
- Sağ: bakiye. Değişimde 600 ms sayım; artış `gain`, azalış `loss` kısa renk parlaması; altında 2 sn süren küçük fark (+3.20).
- Bakiye'ye dokun → "Para geçmişi" sheet'i (son 30 işlem, gelir/gider kaynağı).

### 3.3 Gezinme kuralları
- Her sekmenin kendi yığını vardır; aktif sekmeye tekrar dokunmak kök ekrana döner.
- Donanım geri tuşu: açık sheet → alt ekran → ana sekme (Depo) → çıkış onayı (2 sn içinde çift basış).
- Derin bağlantılar (bildirimden): `kasa/:id`, `siparis/:id`, `piyasa/:id`.
- **Tüm ana eylemler ekranın alt %40'ında** (tek el erişimi). Başlık ve bilgi üstte, eylem altta.

---

## 4. Ekran ekran özellikler

Her ekran için: amaç · yerleşim · durumlar · etkileşim · mikro metin · kenar durumları.

### 4.1 DEPO (ana merkez)

**Amaç:** 3 saniyede "şimdi ne yapayım?" cevabı; geri dönüş nedenlerini tek yerde toplamak.

```
┌──────────────────────────────┐
│ ŞİMDİ YAPILABİLİR            │  ← Akıllı öneri kartı (tek, büyük, amber)
│ 2 ücretsiz kasa seni bekliyor│
│ [ AÇ ]                       │
├──────────────────────────────┤
│ VARDİYA   ⏱ 03:12 saat birikti│  ← Depo ekibi geliri
│ +$4.80          [ TOPLA ]    │
├───────────┬──────────────────┤
│ SUPPLY    │ SERİ  🔥 6 gün   │
│ 1s 12dk   │ ●●●●●●○          │
├───────────┴──────────────────┤
│ SİPARİŞLER (2 yeni)  ›       │  ← bayi kartları, yatay kaydır
│ [Selin: AK Redline FT $38]   │
├──────────────────────────────┤
│ BUGÜNÜN HEDEFLERİ  2/4       │
│ ▰▰▰▱ 12/20 kasa aç           │
├──────────────────────────────┤
│ PİYASA NABZI                 │
│ ▲ Fracture Case  +8.2% (24s) │
│ ▼ Chroma 3 Case  −3.1%       │
└──────────────────────────────┘
```

**Akıllı öneri motoru** (öncelik sırasıyla ilk eşleşen gösterilir):
1. Alınmamış ödül varsa (görev/sezon/çark/supply) → "Ödülünü al".
2. Ücretsiz kasa varsa → "N ücretsiz kasa seni bekliyor".
3. Tamamlanabilir sipariş varsa (envanterde uygun eşya) → "Selin'in siparişini karşılayabilirsin (+$X prim)".
4. Bakiye < en ucuz kasa ve satılabilir eşya varsa → "Rafta $X'lık eşya var, bozdur".
5. Albümde 1 eksik kalan koleksiyon varsa → "Şu koleksiyon 1 parça uzakta".
6. Fiyatı %10+ düşen kasa varsa → "Fracture Case ucuzladı".
7. Varsayılan → "Bir kasa aç" (en son açılan kasa).

**Durumlar:** ilk açılış (Bölüm 11), ödül yok (öneri 7), çevrimdışı (fiyat uyarısı rozeti "veri 5 sa önce"), yükleniyor (iskelet kartlar, 300 ms üstü).
**Dokunma:** her kart ilgili sekmeye derin bağlantı; öneri kartı eylemi doğrudan yapar.
**Kabul:** Depo ekranı soğuk açılıştan sonra 1.5 sn içinde etkileşime hazır; hiçbir kart boş görünmez (her biri bir boş durum metni taşır).

### 4.2 KASALAR — raf listesi

**Amaç:** doğru kasayı hızlı bulmak ve kafa karıştırmamak (42 kasa).

- Üstte arama + **görünüm**: *Raf* (3 sütun kart) / *Liste* (satır: görsel, ad, fiyat, RTP, trend).
- **Sıralama/filtre** (tek sheet): Fiyat, Beklenen getiri (RTP), Çıkış tarihi, Aktif havuz/emekli, Ücretsiz stoklu, Favori, "Bıçak içeren", "Eldiven içeren".
- **RTP rozeti** her kartta: renk kodlu (≥%60 yeşil, %40–60 sarı, <%40 kırmızı) ve dokununca açıklama: "Bu kasanın uzun vadede geri verdiği tahmini oran (satış komisyonu sonrası)". **Bu oyunun özgün şeffaflık özelliği.**
- Kart bilgisi: görsel, ad, fiyat (kasa+anahtar), 24 sa fiyat oku (▲▼), ücretsiz stok rozeti, favori yıldızı.
- Uzun bas → hızlı menü: Favori, Fiyat grafiği, İçeriği gör.
- Boş filtre: "Bu filtrede kasa yok" + "Filtreyi temizle".
- Kenar: emekli kasa (aktif havuzdan kalkmış) üstte "EMEKLİ" damgası; fiyatı genelde yüksek.

### 4.3 KASA DETAY

**Amaç:** açmadan önce bilgilendir, açarken heyecan ver, açtıktan sonra akıcı tekrar sağla.

```
┌──────────────────────────────┐
│        [ kasa görseli ]      │  ← sahne (açılışta şeride dönüşür)
│        Fever Case            │
│  RTP %30 · ▲ +2.1%/24s       │
│  [   KİLİDİ AÇ  $2.99   ]    │  ← ana eylem (amber)
│  AÇ: [1][2][3][4][5][6][⋯]   │
│  ○ Oto-çevir ○ Oto-sat ○ Hızlı│
│ ─ İçerik ─ Olasılık ─ Geçmiş ─│  ← 3 alt sekme
└──────────────────────────────┘
```

**Alt sekmeler**
1. **İçerik:** nadirlik gruplarına bölünmüş ızgara. Kart: görsel, ad, **fiyat aralığı (en düşük–en yüksek aşınma)**, düşme %. Dokun → eşya sheet'i (5 aşınma × normal/ST fiyat tablosu, float çubuğu, "bu eşyayı koleksiyonumda var mı" işareti).
2. **Olasılık:** nadirlik pastası değil, **yatay yığılmış çubuk** (renk + sembol), altta rakamlar ve "beklenen değer $X, maliyet $Y, RTP %Z" cümlesi; "senin gerçek sonuçların" karşılaştırması (Bölüm 6.6).
3. **Geçmiş:** bu kasadan açtıkların (son 50, kronolojik şerit), toplam harcama/kazanç, en iyi drop.

**Adet seçici:** 1–6 sabit; **⋯** ile 10/25/50 (Toplu Açma mağazadan alınmışsa). Bakiye yetmeyen adetler soluk; dokunulursa "Eksik $X" toast'u ve "Eşya sat" kısayolu.

**Ayar satırı (Üç anahtar)**
- **Oto-çevir:** sonuç gösterilir, 1.7 sn sonra otomatik sonraki tur. *Kırmızı veya altın çıkarsa durur.* Bakiye < maliyet olursa durur. Her 25 turda "Devam edeyim mi?" (mola hatırlatıcı mantığı).
- **Oto-sat:** eşik seçilebilir (<$0.10 … <$10) + "Yalnız Mil-Spec" modu. Covert+ **asla** otomatik satılmaz.
- **Hızlı:** animasyon yok, 0.4 sn'de sonuç.

**Maliyet satırı:** "Anahtar + Kasa $2.99" + ücretsiz stok varsa "(2 ücretsiz)" + yetersizse "Eksik $0.80".

**Yükleme:** ilk girişte görseller önyüklenir; **iskelet + gerçek ilerleme çubuğu** (sahte yüzde yok). 3.5 sn aşılırsa devam eder, kalanlar tembel yüklenir.

**Kenar durumlar:** çevrimdışı ve görsel yok → silah adı + nadirlik rengi kutusu (placeholder); fiyat verisi yok → "~" tahmin etiketi ve "Fiyatları yenile" bağlantısı.

### 4.4 AÇILIŞ KOREOGRAFİSİ (en kritik an)

Dürüstlük kuralı: **şeritteki komşu eşyalar gerçek olasılık dağılımından çekilir**; sonuç belirlendikten sonra değiştirilmez; "neredeyse kazandım" görüntüsü kasıtlı üretilmez. Oyuncuya bunu söyleyen satır ayarlarda yer alır.

**Tek kasa zaman çizelgesi (6.2 sn)**

| t (sn) | Olay | Ses | Titreşim |
|---|---|---|---|
| 0.00 | Buton basılır, bakiye düşer (−$2.99 sayım) | kilit | hafif |
| 0.00–0.35 | Kasa görseli kapanıp şeride dönüşür (ölçek+solma) | kapak | – |
| 0.35–1.60 | Hızlanma (ease-in) | tık, pitch artar | tık başına mikro-darbe (rate-limit 25 ms) |
| 1.60–5.00 | Sabit hız → yavaşlama (özel Bézier) | tıklar seyrekleşir | seyrekleşir |
| 5.00–5.90 | Son 3 hücre; ibre kutuya kenetlenir | düşük bas darbe | orta |
| 5.90 | **Duruş** | darbe | nadirliğe göre desen |
| 5.90–7.30 | **Ortaya çıkış** (aşağıdaki tablo) | melodi | nadirliğe göre |

**Nadirlik ortaya çıkışları**

| Nadirlik | Efekt | Süre | Ses | Titreşim deseni (ms) |
|---|---|---|---|---|
| Mil-Spec (mavi) | kutu hafif parlar | 350 | tek nota | 20 |
| Restricted (mor) | mor halka yayılır | 500 | iki nota | 20-40-20 |
| Classified (pembe) | halka + hafif ekran kenarı parıltısı | 700 | arpej | 30-40-30-40-60 |
| Covert (kırmızı) | ekran kısa kararır, kırmızı flaş, eşya büyür, hafif sarsıntı | 1000 | arpej + sub-bas | 40-30-40-30-120 |
| Nadir Özel (altın) | 0.4 sn sessizlik, beyaz flaş, altın parçacıklar, eşya merkeze uçar, ad harf harf yazılır | 1400 | akor + parıltı | 60-40-60-40-200 |

**Atlama:** her an dokun → hedef konuma 250 ms'de oturur (sonuç aynı). Varsayılan ayar: ilk 20 açılışta animasyon tam, sonra "Hızlı moda geçmek ister misin?" bir kez sorulur.

**Çoklu kasa (2–6):** şeritler alt alta, her biri 250 ms kaymalı başlar ve sırayla durur; sesler tek şeritten (en üstteki) çalar, ancak en yüksek nadirlik duruşu o şeridin melodisini öne çıkarır. 6 şerit yükseklikleri 56–64px; ekrana sığmazsa sahne küçülür, düğme sabit kalır.

**Sonuç paneli (alt sheet)**
- Eşya kartları (tek: büyük; çoklu: 2 sütun), toplam değer, "YENİ REKOR" / "Albüm: yeni parça!" etiketleri.
- Eylemler: **Hepsini sat** (amber), **Seçilenleri sat**, **Tut**, **Tekrar aç** (aynı adet). Sheet kapanınca oto-çevir devam eder.
- Eşya başına: dokun → seç; uzun bas → detay.

### 4.5 KASAM (envanter, albüm, mühürlü stok, vitrin)

Üç alt sekme: **Eşyalar · Albüm · Mühürlü**.

**Eşyalar**
- Üst: arama, toplam değer rozeti, **toplam değer değişimi** (son 24 sa, fiyat verisine göre ▲▼).
- Çipler: Yeni, Değer, Nadirlik, Float, A-Z, Tür (silah sınıfı), ST, Kasa.
- Görünüm: ızgara (2/3 sütun) / liste (fiyat sütunu hizalı, mono yazı).
- Seçim modu: uzun bas → çoklu seçim, altta sabit eylem çubuğu: **Sat**, **Takasa ekle**, **Vitrine koy**, **Albüme işle**.
- "Akıllı seçim" menüsü: En ucuz 10, "Albümde zaten olanlar" (tekrarlar), "Siparişe uygun olanlar".
- Eşya detay sheet'i (**Float Lab**, Bölüm 4.6).

**Albüm** (Bölüm 6.1 detay): kasa kasa koleksiyon sayfaları.

**Mühürlü:** satın alıp açmadan sakladığın kasalar (stok) — Piyasa/borsa ile bağlantılı (Bölüm 6.2).

**Vitrin:** 3 eşyalık sergi; profil kartında görünür. Kilit: Sv.8.

### 4.6 EŞYA DETAYI — "Float Lab"
- Büyük görsel (pinch-zoom).
- **Float şeridi:** 0–1 arası beş aşınma bölgesi renkli; ibre float'ı gösterir; "bu skin'in mümkün aralığı" gri bantla işaretli; **aynı aşınma içindeki konumu** yüzdelik olarak yazılır ("FN içinde %12 — düşük float").
- Desen numarası; özel desen (Blue Gem, Doppler fazı) varsa "Özel desen" rozeti ve çarpan açıklaması.
- **Fiyat paneli:** o aşınma için piyasa fiyatı, bu float'ın primi, **fiyat geçmişi mini grafiği** (30 gün), "Satış değeri %90".
- Eylemler: Sat · Upgrade'a gönder · Takasa ekle · Vitrine · Siparişe teklif.
- "Bu eşya hangi kasalardan çıkar" bağlantısı.

### 4.7 PİYASA (özgün çekirdek)

Üç alt sekme: **Nabız · Borsa · Siparişler**.

**Nabız**
- Üstte piyasa endeksi: izlenen 42 kasanın fiyat ortalaması, 24 sa/7 gün/30 gün çizgi grafik.
- "En çok yükselen / düşen" 5'er kasa ve eşya.
- **Fırsat kartı:** "Fever Case 7 günün en düşük fiyatında".
- Veri tazeliği göstergesi: "Fiyatlar 2 sa 14 dk önce · Skinport".

**Borsa (Mühürlü kasa alım-satım)** — Bölüm 6.2.

**Siparişler (Bayi sistemi)** — Bölüm 6.3.

### 4.8 ATÖLYE

- Kart ızgarası: **Upgrade · Takas · Coinflip · (Case Battle yakında)**; her kartta kısa durum satırı ("Son 24 sa: 3 galibiyet").
- **Upgrade** (Sv.5): iki adımlı: "Girdi" + "Hedef". Hedef listesi **çarpan sekmeleri** (x1.5 … x50) ve **elle fiyat aralığı**; şans halkası (yeşil dilim = kazanma); dönen ibre; sonuç.
  - Şeffaflık: şans, ev payı %5, "bu 100 denemede ortalama kayıp".
  - Güvenlik: **Covert üstü girdi için onay** ("Bu eşya $230. Emin misin?" 2 sn basılı tutma).
- **Takas** (Sv.3): 10 yuvalı halka düzeni, "Otomatik doldur", sonuç olasılıkları, float tahmini **önceden**; imza hareketi (parmakla imza çiz) → onay.
- **Coinflip** (Sv.10): bahis çipleri (sabit + "yarısı" + "hepsi" yerine **limit**: tek seferde bakiyenin %50'sini aşamaz); yazı/tura; seri sayacı; **kaybetme serisi 5'te "mola ver" önerisi**.
- Her oyunun altında "Sanal para. Gerçek para yok." ve toplam kayıp/kazanç özeti.

### 4.9 PROFİL (kimlik rozetinden açılır)
Bölümler: **Kart** (seviye, vitrin, ünvan) · **Sezon** (basamak şeridi) · **Görevler & Seri** · **Karne** (Bölüm 6.6) · **Başarımlar** · **Ayarlar** · **Hakkında**.

### 4.10 AYARLAR
- Ses, titreşim (ayrı), hareketi azalt, animasyon hızı, **büyük yazı**, **renk körü modu** (Bölüm 9), dil (TR/EN), para birimi gösterimi (USD / TRY dönüşümlü, kur sabit değil güncel — isteğe bağlı), oto-çevir güvenlik eşikleri, **mola hatırlatıcı**, veri dışa aktar/içe aktar (JSON), oyunu sıfırla (iki aşamalı onay), adil-oyun doğrulayıcı.

---

## 5. İlk 3 dakika (ilk kullanıcı deneyimi)

| Zaman | Ekran | Ne olur |
|---|---|---|
| 0:00 | Açılış | 1.2 sn logo, fontlar/veri hazır |
| 0:02 | Hoş geldin | Tek ekran: "Gece vardiyasındasın." 3 madde (kasa aç · sat · büyü) — **geç** düğmesi görünür |
| 0:10 | Hediye | "Tanıtım kasası" (ücretsiz). **Etiket açıkça yazılı:** "Başlangıç hediyesi. En az Restricted garantili." Not: bu tek kasa özel olasılıklıdır; provably-fair iddiası dışındadır ve ekranda belirtilir |
| 0:20 | Açılış | Tam koreografi; ilk eşyanın gerçek fiyatı gösterilir |
| 0:50 | Karar | Sheet: "Sat ($X) / Tut". İpucu: "Satarsan bakiyene eklenir." Seçim ne olursa olsun devam |
| 1:10 | Depo | Öneri kartı: "Şimdi gerçek bir kasa aç" (en ucuz iyi RTP'li kasa) |
| 1:30 | Kasalar → Detay | **RTP rozeti** ilk kez açıklanır (tek seferlik balon) |
| 2:00 | İkinci açılış | Gerçek kasa; sonuç sonrası "Albüm: ilk parça!" kutlaması |
| 2:30 | Görev | "Bugünün hedefleri" kısa tanıtım, ilk görevin ilerlemesi gösterilir |
| 3:00 | Serbest | Tüm sekmeler açık görünür, kilitliler "Sv.X'te açılır" |

Kural: eğitim **dokunarak öğrenme**; metin duvarı yok; her balon tek cümle ve tek kez gösterilir; "Eğitimi atla" ayarlarda geri alınabilir.

---

## 6. Özgün sistemler

### 6.1 Koleksiyon Albümü
**Fikir:** her kasanın bir "koleksiyon sayfası" vardır; her eşya × aşınma (5) × (normal / StatTrak) bir **yuva**dır. Eşya bulunca yuva dolar (eşya envanterde kalabilir ya da albüme "işlenir").

- Yuva sayısı: kasa başına yaklaşık 17 eşya × 5 aşınma = 85 + ST (kasaya göre) → ilerleme yüzdesi.
- **Gerçekçi zorluk:** bazı yuvalar neredeyse imkânsızdır (örn. Factory New nadir skin) → bu yüzden **üç seviye** hedef: *Parça koleksiyonu* (her eşya en az bir aşınmada), *Tam aşınma seti*, *Mükemmel* (ST dahil).
- Ödüller: %25/50/75/100 eşikleri → nakit, ücretsiz kasa, vitrin çerçevesi, ünvan.
- İşleme: eşya albüme işlenince envanterden çıkar (satılamaz) **ya da** "kopyayı sakla" seçeneğiyle envanterde kalır ama albüm yuvası dolar (kolay mod, ayar).
- **"Eksik 1" bildirimi:** bir sayfa tamamlanmaya 1 parça kala Depo'da öneri çıkar.
- Albüm görünümü: gri silüet + fiyat etiketi (kaç para eder), dolu olanlar renkli, ★ = StatTrak.
- Neden iyi: kaybetmek bile ilerleme sağlar; uzun vadeli hedef; envanteri satmak yerine anlam kazandırır.

### 6.2 Kasa Borsası (Mühürlü kasa stoku)
Gerçek CS2'de açılmamış kasalar yatırım aracıdır. Oyunda:
- Oyuncu kasayı **açmadan satın alıp saklayabilir** ("Mühürlü" sekmesi). Alış fiyatı = kasa piyasa fiyatı + sabit **spread %2**, satış = piyasa − %2. (Anahtar alınmaz; açarken anahtar maliyeti ayrıca ödenir ya da anahtar maliyeti ayrı kalem.)
- **Fiyat geçmişi:** fiyat botu her çalışmada `history.json`'a anlık görüntü ekler (3 saatte bir, 90 gün); uygulama 24 sa / 7 gün / 30 gün çizgi grafik gösterir.
- Emekli kasalar zamanla değer kazanabilir (gerçek veri); oyuncu "yatırım hissi" yaşar.
- **Fiyat uyarısı:** "Fever Case $2.50'nin altına inerse haber ver" (yerel bildirim, uygulama açıkken veya arka plan görevi ile).
- Portföy ekranı: toplam değer, alış maliyeti, kâr/zarar, **gerçekleşmemiş K/Z**.
- Dengeleme: günlük alım sınırı yok, ama **portföy toplam değeri bakiyenin 5 katını geçemez** (sınırsız spekülasyon/hile önlemi). Fiyat güncel değilse (>12 sa) alım-satım **kapalı** ("Piyasa verisi eski").
- Fiyat verisi 3 saatte bir olduğu için gün içi spekülasyon sınırlı; bu **bilinçli** — gerçek bir borsa simülasyonu değil, "piyasa okuma" oyunu.

### 6.3 Bayi Siparişleri (özgün hedef sistemi)
Altı bayi (NPC), her birinin kişiliği ve tercihi var; envanterdeki eşyaya **anlamlı bir kullanım** verir.

| Bayi | Karakter | Ne ister | Prim |
|---|---|---|---|
| **Selin** | Koleksiyoncu | Belirli skin + belirli aşınma | +%15–25 |
| **Berk** | Toptancı | N adet Mil-Spec (ucuz toplu) | +%6–10, büyük hacim |
| **Mert** | Float avcısı | Düşük float (örn. FN < 0.02) | +%20–40 |
| **Aylin** | Bıçak meraklısı | Belirli bıçak türü | +%10–20 |
| **Kaan** | Yatırımcı | Mühürlü kasa (N adet) | +%4–8 |
| **Duru** | Tuhaf istekler | Deseni özel (Blue Gem, Doppler fazı) | +%30–60 |

**Üretim kuralları** (oyuncu gerçekçi ve ulaşılabilir hissetsin):
- Sipariş üretimi **oyuncunun envanterine ve albümüne göre** tohumlanır: %50 envanterde zaten karşılığı olan, %30 "kolay ulaşılır" (kasa aç, bulursun), %20 "uzun hedef".
- Süre: 24–72 sa (gerçek zamanlı). Süresi dolunca bayi "bir dahaki sefere" der, ceza yok.
- Aynı anda en fazla 4 sipariş.
- **İtibar:** her tamamlanan sipariş bayi itibarı verir (5 seviye: Tanıdık → Dost → Müdavim → Ortak → Efsane). Üst seviyeler daha yüksek prim, özel siparişler, **kişisel mesajlar**.
- Eşya teslimi: sürükle-bırak veya "Teslim et" → fiyat kıyası (piyasa $38.00, teklif $44.60).

### 6.4 Depo Ekibi (idle gelir — tıklayıcının yerine geçer)
Tıklayıcı oyun hissini düşürüyor; yerine **depo ekibi** gelir:
- 5 çalışan türü (Sayıcı, Forklift sürücüsü, Etiketçi, Güvenlik, Müdür). Her biri saatlik gelir + özel etki (örn. Etiketçi: oto-sat eşiğini +%; Güvenlik: supply drop süresi −10%).
- **Çevrimdışı birikim:** en fazla 8 saat; **Vardiya toplama** düğmesi Depo'da. 8 saat dolunca "Depo doldu" (geri dönüş nedeni).
- Yükseltme maliyeti üstel (×1.35), geri dönüş süresi hedefi **gerçekçi**: temel gelir $0.60/sa → ileri seviye $12/sa (Bölüm 7).
- Tıklama: "Kasa sayma" mini etkileşim (isteğe bağlı) — bekleyen vardiya geliri bu mini oyunla %20'ye kadar artırılabilir; zorunlu değil.

### 6.5 Seri ve Günlük Ritim
- **Seri:** her gün en az bir görev tamamlayınca 🔥 → seri artar (ikon: ateş çizgi ikonu). 7. günde ücretsiz kasa paketi, 30. günde vitrin çerçevesi. **Seri dondurma:** ayda 2 kez otomatik korunur ("Bir gün kaçırdın, seriyi dondurdum").
- **Görev havuzu:** 30 görev (kasa aç, sat, belirli nadirlik, Albüm parçası, sipariş tamamla, piyasa alım, float ≤ X, Upgrader'da x5 dene...). Günde 4 + haftalık 2 büyük görev.
- Tüm ödüller **sezon yıldızı**na da akar.

### 6.6 Kasa Karnesi (özgün şeffaflık ve hikâye)
Profilde ve Kasa Detay → Geçmiş'te:
- **Beklenen vs. Gerçek:** "Sen 120 kasa açtın. Beklenen getiri $186, gerçek getiri $241 — +%30 şanslısın." (Basit, anlaşılır cümle.)
- Nadirlik dağılımı: beklenen % ve gerçek % yan yana çubuklar.
- **Para akışı grafiği:** zaman içinde bakiye + envanter değeri (net değer), olay işaretleri (altın çıktı, büyük kayıp).
- "Kayıp serisi" göstergesi: ardışık Mil-Spec sayısı; **şans düzeltmesi yok** (provably fair korunur) ama bilgi hissettirir.
- **Defter (günlük):** otomatik tutulan olay akışı ("14:32 — Fever Case'ten ★ Karambit Doppler çıktı: $412"). Paylaşılabilir görüntü (ekran görüntüsü kartı) ürettir.

### 6.7 Sezon (30 gün)
- 50 basamak, basamak başına 5 yıldız. Yıldız kaynakları: görev, sipariş, albüm eşiği, seri.
- İki şerit: **Ücretsiz** (nakit, kasa, vitrin çerçevesi) ve **Depo Pası** (sanal para ile alınabilen, kozmetik ağırlıklı ek şerit; gerçek para yok).
- Sezon sonu: **Karne ekranı** (açılan kasa, en iyi drop, albüm ilerlemesi), yeni sezon başlar, albüm/envanter korunur.

### 6.8 Mola ve Sorumlu Oyun
- Her 45 dk oturumda nazik hatırlatma ("45 dakikadır buradasın. Bir ara?"). Ayarlardan kapatılabilir.
- Oto-çevir üst sınırı: oturumda 100 tur sonra durur.
- Coinflip ve Upgrade'de "kayıp serisi" uyarıları.
- Tüm ekranlarda sanal para notu; yaş: 17+/18+ dereceli.

---

## 7. Ekonomi ve denge

### 7.1 Girişler ve çıkışlar (saatlik hedef)
| Kaynak | Hız | Not |
|---|---|---|
| Başlangıç | $50 | + ilk gün onboarding bonusu $20 |
| Depo ekibi | $0.60/sa → $12/sa | Seviye + yükseltme ile |
| Supply drop | ~$1.3 / 2 sa | Ya da 1–2 ücretsiz kasa |
| Günlük görevler | ~$6–8 / gün | + yıldız |
| Siparişler | ort. +$4–15 / sipariş (prim) | Günde 1–3 |
| Seri / sezon | ~$80 / sezon + kasalar | |
| Seviye atlama | $0.5 × seviye | 5 seviyede 3 ücretsiz kasa |
| Çark | ort. ~$2.4/gün | |

Çıkışlar: kasa+anahtar, takas/upgrade kaybı, coinflip ev payı, mağaza alımları, ekip yükseltmeleri.

### 7.2 Hedef davranış
- Yeni oyuncu ilk 15 dakikada **15–25 kasa** açabilmeli (ucuz kasalarda).
- Orta oyuncu bir hafta sonunda **net değerinin** (bakiye+envanter) başlangıçtan %10–30 yukarıda olması mümkün olmalı **(özenli oyunla)**; yalnız kasa açarak ortalama %55–60 kaybetmesi beklenir. Bu bilinçli: gerçekçilik.
- Para bitince oyun **kilitlenmemeli** (güvenlik ağı): bakiye < en ucuz kasa ve satılacak eşya yoksa → "Vardiya avansı" $5 (günde en fazla 3 kez) ya da ücretsiz mini görev.

### 7.3 Ayarlanabilir sabitler (`balance.json`)
```
startBalance 50, onboardBonus 20, sellRate 0.90,
supplyMinutes 120, supplyCashRange [0.3, 2.5],
upgraderEdge 0.05, coinflipPayout 1.9, coinflipMaxBetPct 0.5,
crewBase 0.60, crewGrowth 1.35, crewOfflineCapHours 8,
orderPremium {Selin:[.15,.25], ...}, marketSpread 0.02,
portfolioCapMultiple 5, seasonDays 30, starsPerTier 5
```
Sabitler uzaktan (GitHub'daki JSON) güncellenebilir; uygulama sürümü beklemeden denge ayarı yapılır.

### 7.4 Seviye eğrisi
`XP(n) = 40·n^1.15`; Sv.100 için toplam ≈ 70 bin XP. Hedef tempo: Sv.10 ≈ ilk gün, Sv.25 ≈ ilk hafta, Sv.50 ≈ 2 ay, Sv.100 ≈ 8–12 ay (hafif oyuncu).

**Kilit açılımları:** 2 Oto-çevir · 3 Takas · 5 Upgrade · 6 Piyasa/Borsa · 8 Vitrin · 10 Coinflip · 12 Siparişler (yalnızca Selin) · 15 diğer bayiler · 20 Toplu Açma indirimi · 25 Albüm "Mükemmel" · 40 Yeni kasa havuzu etkileşimi · 60 prestij · 100 "Depo Efsanesi".

**Prestij:** Sv.100'de isteğe bağlı sıfırlama → kalıcı +%5 XP, özel çerçeve, albüm korunur.

---

## 8. Teknik mimari

### 8.1 Modüller
```
src/
  theme/           tokens.ts, typography.ts, motion.ts
  components/      Button, Card, Chip, Sheet, Toast, Skeleton, EmptyState,
                   PriceText, RarityBadge, FloatBar, Sparkline, Reel, Counter
  screens/         depo/, kasalar/, kasam/, piyasa/, atolye/, profil/
  engine/          rng, drops, pricing, economy, orders, album, crew, missions
  store/           game (kalıcı), prices (önbellek), ui (geçici), history
  services/        notifications, haptics, audio, share, backup
  data/            game.json, balance.json
```
- **Zustand + selector** (gereksiz render yok); kalıcılık AsyncStorage; **şema sürümü + migrasyon** zinciri.
- Ağ: fiyat dosyası (`prices.json`), geçmiş (`history.json`), denge (`balance.json`) — hepsi GitHub raw; **ETag/If-None-Match** ile 304 desteği; sağlama toplamı doğrulama.
- Fiyat botu: 3 saatlik cron, Skinport'tan çek → **medyan/aykırı değer filtresi** → `prices.json` + `history.json`'a ekle (90 gün tut). Skinport başarısızsa son veriyi koru; ikinci kaynak (CSFloat) yedek.

### 8.2 Performans bütçesi
| Ölçüt | Hedef |
|---|---|
| Soğuk açılış | ≤ 2.5 sn (orta segment cihaz) |
| Şerit | 60 fps, 6 şerit aynı anda ≥ 50 fps |
| Bellek | ≤ 220 MB (görsel önbelleği sınırlı, 80 MB) |
| Liste kaydırma | 0 düşen kare 1000 eşyada |
| APK boyutu | ≤ 45 MB |

Teknikler: `FlatList` + `getItemLayout`, sabit boyutlu hücre, `expo-image` önbellek politikası `memory-disk`, şerit hücreleri `React.memo`, animasyonlar `useNativeDriver` / ileride Reanimated worklet, görsel küçük çözünürlük (CDN parametresiyle 256px).

### 8.3 Güvenlik ve bütünlük (istemci tarafı)
- RNG: HMAC-SHA256 zinciri; tohumlar kalıcı; **tohum bilgisi cihazda** (sunucu yok → mod "yerel"). Sunucu eklenirse (Faz 4) otoriter RNG.
- Kayıt dosyası imzası (HMAC, cihaz anahtarı) — basit hile engeli; kaydı düzenleyen için uyarı.
- Zaman: çevrimdışı gelir, sistem saatine bağlı → **geri saat oynama tespiti** (son görülen zaman monoton).

### 8.4 Erişilebilirlik teknik
Dokunma hedefi ≥ 44px, `accessibilityLabel` her etkileşimde, dinamik yazı ölçeği 200%'e kadar bozulmadan, ekran okuyucu için nadirlik adı sesli okunur ("Covert, AK-47 Kızıl Çizgi, 38 dolar").

---

## 9. Erişilebilirlik ve kapsayıcılık
- **Renk körü:** nadirlik rengine ek **sembol**: Mil-Spec ●, Restricted ◆, Classified ▲, Covert ■, Nadir ★. Ayarlarda desenli mod.
- **Kontrast:** metin/zemin ≥ 4.5:1 (amber `#FFB02E` üzerinde koyu yazı 11:1); küçük yazı ≥ 12px.
- **Hareket hassasiyeti:** "Hareketi azalt" → parçacık ve sarsıntı kapanır, geçişler 80 ms.
- **Ses:** tüm ses ipuçlarının görsel eşleniği vardır.
- **Tek el:** birincil eylemler alt bölgede; sheet kaydırarak kapanır.
- **Dil:** TR varsayılan, EN; tüm metinler `i18n` anahtarlarında; sayılar yerel biçim.

---

## 10. Uyumluluk ve risk

| Risk | Önlem |
|---|---|
| Google Play "simüle kumar" | 17+/18+ derece, "gerçek para ödülü yok", tüm kumar benzeri ekranlarda sanal para notu; gerçek para ile sanal para satışı **yok**; reddedilirse APK doğrudan dağıtım |
| Valve fikri mülkiyeti | Ad/ikon/kapak CS marka içermez; "Valve ile bağlantılı değildir"; skin görselleri üçüncü taraf API'den, kendi sunucuda yeniden barındırma **yok** |
| Fiyat verisi | Skinport kullanım şartlarına uy (önbellek, oran sınırı), kaynak belirt |
| Sorumlu oyun | Mola, oto-çevir sınırı, kayıp serisi uyarıları |
| Veri | Hesap yok, kişisel veri toplanmaz; yerel kayıt + isteğe bağlı dışa aktar |
| Hile | Yerel oyun olduğu için sosyal sıralama yoktur; Faz 4'te sunucu ile çözülür |

---

## 11. Yol haritası

Her faz bir APK sürümüdür; **kabul ölçütleri** karşılanmadan sonraki faza geçilmez.

| Faz | Kapsam | Süre (tahmin) | Kabul ölçütü |
|---|---|---|---|
| **A — Temel** | Tasarım token'ları, yeni font/ikon seti, 5 sekme yapısı, üst durum çubuğu, Depo ana ekranı (öneri motoru, vardiya, supply, seri), Para geçmişi | 1 hf | Depo 1.5 sn'de hazır; tüm sekmeler yeni dil |
| **B — Tören** | Kasa detayı yeniden (3 alt sekme, RTP rozeti, olasılık çubuğu), yeni açılış koreografisi (5 nadirlik), titreşim desenleri, atlama, sonuç sheet'i | 1.5 hf | 6 şerit ≥50 fps; tüm nadirlikler test edilmiş |
| **C — Koleksiyon** | Albüm, Float Lab, Kasam yeniden, Vitrin | 1.5 hf | 42 kasa albüm sayfası, ilerleme doğru |
| **D — Piyasa** | `history.json` + grafikler, Nabız, Mühürlü stok/Borsa, fiyat uyarısı | 1.5 hf | 30 gün grafiği, K/Z hesabı doğru |
| **E — Bayiler** | Sipariş üretimi, itibar, mesajlar, teslim akışı | 1.5 hf | 6 bayi, üretim kuralları testli |
| **F — Ekip ve Ekonomi** | Depo ekibi, `balance.json`, güvenlik ağı, görev havuzu (30), sezon 2 şerit | 1 hf | Ekonomi simülasyonu: 1000 sanal oyuncu, iflas oranı < %5/gün |
| **G — Cila** | İlk 3 dk akışı, erişilebilirlik, TR/EN, mola, karne ekranı, ses seti | 1.5 hf | Maestro e2e + erişilebilirlik denetimi |
| **H — Genişleme** | Case Battle (botlara karşı), (isteğe bağlı) sunucu: sıralama, bulut kayıt | belirsiz | — |

**Önerilen sıra:** A → B (en çok "his" kazandırır) → D (özgünlük) → C → E → F → G.

### Test planı
- **Birim:** RNG belirlenimi, drop oranları (1M deneme ±0.05), float/ST, fiyat tahmin, ekonomi sabitleri, sipariş üretimi, albüm ilerleme.
- **Ekonomi simülasyonu:** Monte Carlo — farklı oyuncu stratejileri (sadece aç, sat-aç, yatırımcı) için bakiye eğrisi ve iflas oranı; her denge değişikliğinde çalıştırılır.
- **Görsel:** ekran görüntüsü karşılaştırma (Maestro), 3 cihaz sınıfı (küçük/orta/büyük), karanlık/yazı ölçeği 150%.
- **Kullanılabilirlik:** 5 kişilik hızlı deneme; "ilk 3 dk" ve "para bitti" senaryoları; ölçüt: görev tamamlama ≥ %90.

---

## 12. Açık sorular (karar bekleyen)

1. **Ad:** "DEPO" mu, başka bir ad mı? (Mağaza ve ikon buna bağlı)
2. **Kumar benzeri oyunlar** (Coinflip, Upgrade) kalsın mı, Play riskine karşı çıkarılsın mı?
3. **Sunucu** (bulut kayıt, sıralama) istenir mi? İstenirse Faz H'de Supabase benzeri bir backend gerekir.
4. **Depo Pası** (sanal para ile alınan ek sezon şeridi) ekonomiye uygun mu?
5. **Albümde "kopyayı sakla"** kolay mod varsayılan mı olsun?

---

## 13. Bir sonraki adım

Önerim **Faz A + B'yi birlikte** başlatmak: yeni görsel dil, 5 sekme, Depo ana ekranı ve yeniden yazılmış açılış koreografisi. Bunlar oyunun "ilk izlenimini" belirler ve geri kalan fazların temelidir.

Onaylarsan yukarıdaki açık soruları varsayılanlarıyla (1: DEPO, 2: kalsın, 3: sonra, 4: sonra, 5: evet) kabul edip Faz A'yı yazmaya başlarım.
