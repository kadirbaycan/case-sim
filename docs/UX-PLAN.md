# Case Sim — Arayüz ve Oyun Hissi Planı (v2)

Referans: gönderdiğin 9 ekran görüntüsü. Amaç: aynı **kullanım kolaylığı ve çekim gücü**, ama kendi tasarımımız, kendi adımız, kendi görsellerimiz (referansın marka/ikon/avatarı kopyalanmaz).

## 1. Referanstan çıkardığım ilkeler

| Gözlem | Neden işe yarıyor | Bizde karşılığı |
|---|---|---|
| Her ekranda **sabit üst bar**: geri, avatar + seviye rozeti, bakiye | Oyuncu hep nerede olduğunu ve ne kadar parası olduğunu bilir | Üst bar: ‹ geri, avatar+Sv rozeti (dokununca profil), XP çizgisi, bakiye |
| **5 sekme**: Kasalar, Envanter, Kontratlar, Oyunlar, Mağaza | Az sekme, her biri net bir amaç | Aynı 5 sekme (isimler Türkçe) |
| Ekranlar **kart + büyük görsel + az yazı** | Tek bakışta anlaşılır | Koyu kart, büyük skin/kasa görseli, tek satır bilgi |
| Kasa detayda **tek büyük yeşil buton** "Kilidi Aç" + altında fiyat | Ana eylem belli | Aynı. Parası yetmezse buton pasif + "Para kazan" kısayolu |
| **1–6 kasa aynı anda**, ⚡ hızlı mod, AUTO SPIN, AUTO KEEP/SELL | Tekrar eden açışı akıcı yapar | Aynı: 1-6 seçici, ⚡ animasyonsuz, otomatik tekrar, otomatik sat eşiği |
| İçerik ızgarası: her eşyada **fiyat aralığı + düşme %'si**, nadirlik rengi alt çizgi | Oyuncu ne şansı olduğunu görür, açma isteği artar | Aynı (3 sütun, gerçek fiyat aralığı Skinport'tan) |
| **Ücretsiz kasa rozetleri** ("FREE ×144") | Para bitince bile oynatır | Görev/sezon/çark/supply drop'tan gelen ücretsiz kasa stoğu |
| **Supply Drop** zamanlayıcı ("1h 47m") | Geri dönme sebebi | 2 saatte bir ücretsiz ödül, geri sayım |
| **Günlük görevler** + yıldız + sezon yolu (1–50, ödüllü basamaklar) | Hedef ve ilerleme hissi | Aynı: 4 günlük görev, yıldız → sezon yolu |
| **Daily Spin**: günde 1 ücretsiz çevirme | Günlük giriş alışkanlığı | Aynı, ödül havuzu (nakit / ücretsiz kasa / nadir eşya şansı) |
| **Profil**: toplam kazanç/harcama, tamamlanan kasalar x/42, açılış sayısı, ünvan şeritleri | Uzun vadeli hedef + gurur | Profil: toplamlar, kasa koleksiyonu x/42, ünvanlar |
| **Yükleme ekranı** ("Loading Fever Case… 28/45" + uçuşan skinler) | Bekleme sıkıcı olmaz, görseller önceden yüklenir | Kasa açılmadan önce eşya görsellerini önbelleğe alırken animasyonlu ilerleme |
| Envanter: arama, toplam değer, sıralama çipleri, ızgara/liste, "simulated value" notu | Büyük envanterde bile yönetilebilir | Aynı + çoklu seçim, toplu satış |
| Oyunlar: büyük kutu kutu ızgara (Coinflip, Upgrade, Trade-Up, Case Battle…) | Keşfetmesi kolay | Oyunlar sekmesi: Upgrader, Takas, Coinflip, Case Battle (botlara karşı), Tıklayıcı |

**Bilerek yapmadıklarım:** gerçek para ile satın alma (TRY fiyatlı mağaza), referansın avatar/ikon/ad/görselleri, Roulette/Mines/Plinko/Crash/Blackjack gibi kumar oyunları (Faz 3'te istersen eklenir; Play Store riski artar).

## 2. Görsel dil

- Zemin `#0e1015`, kart `#171a21`, ikincil `#20242d`, çizgi `#2a2f3a`.
- Ana buton: koyu zeytin yeşili gradyan (`#6c9a3c → #4f7a2a`), büyük harf, kalın, köşe 12.
- Para yeşili `#58d36b`, altın `#f2c14e`, tehlike `#ef5350`.
- Nadirlik renkleri CS2'nin kendisi (mavi, mor, pembe, kırmızı, altın). Kartlarda **alt çizgi** rengi.
- Yazı tipi: Rajdhani (teknik/oyun hissi), sayılarda kalın.
- Köşe yuvarlaklığı 12–16, gölge yok, ince çizgi; dokunma hedefi en az 44px.
- Her dokunuşta hafif titreşim; kritik anlarda (kırmızı/altın) güçlü titreşim + ses.

## 3. Ekran ekran detay

### 3.1 Üst bar (tüm ekranlar)
‹ geri (alt ekranlarda) · avatar dairesi + **Sv.N** rozeti + ince XP çizgisi (dokun → Profil) · sağda `$bakiye` (para değişince sayı animasyonla kayar, artarken yeşil, azalırken kısa kırmızı parlama).

### 3.2 Kasalar sekmesi
- Üst: 3 hızlı kutu — **Supply Drop** (geri sayım / "AL!" yanıp söner), **Günlük Çark** (hazırsa nokta), **Otomatik Aç** (Faz 2).
- Filtre çipleri: Hepsi · Ücretsiz · Ucuz · Pahalı · Yeni · Favori; arama.
- Kart: büyük kasa görseli, ad, fiyat (yetmiyorsa soluk), ücretsiz stok rozeti `ÜCRETSİZ ×n`, ⭐ favori.
- Üç sütun ızgara.

### 3.3 Yükleme geçişi
Kasaya girerken 0.4–1.5 sn: eşyalar dönen halkada uçuşur, "Yükleniyor… 28/45". Aslında görselleri `Image.prefetch` ile önyükler, sonraki açılışlar anında olur.

### 3.4 Kasa detay (en önemli ekran)
- Büyük kasa görseli (hafif yüzer animasyon), ad.
- **Kilidi Aç** butonu (yeşil), altında "Anahtar + Kasa: $2.07" (ücretsiz stok varsa "Ücretsiz kasa kullan").
- Şerit bölgesi: 1 kasada tek yatay şerit; **2–6 kasada alt alta çoklu şerit aynı anda** döner.
- Ayar satırı: **AUTO SPIN** (sonuç sonrası otomatik tekrar), **AUTO TUT/SAT** (⚙ ile eşik: "$X altını otomatik sat, kalanı tut"), ⚡ hızlı mod.
- Adet seçici `1 2 3 4 5 6`, parası yetmeyen adetler pasif.
- İçerik ızgarası (3 sütun): görsel, ad, silah, **fiyat aralığı**, **düşme %**, nadirlik alt çizgisi, dokununca detay (tüm aşınmalar ve fiyatları).
- ★ Nadir özel kartı: bıçak/eldiven listesi + toplam %.
- Alt not: "Sanal değer — gerçek paraya çevrilemez".

### 3.5 Açılış sonucu
- Şerit durunca kazanan kutu büyür, nadirliğe göre renk patlaması (mavi küçük, kırmızı büyük, altın tam ekran parlama + özel ses).
- Sonuç paneli: eşya kartları, her birinde **Tut / Sat**, altta **Hepsini sat · $X** ve **Devam**. Auto-sat açıksa eşik altı olanlar otomatik satılır, özet satırı gösterilir ("3 eşya otomatik satıldı +$1.20").
- Yeni rekor (en değerli drop) olursa "YENİ REKOR" etiketi.

### 3.6 Envanter
- Arama kutusu + toplam değer rozeti.
- Çipler: Değer ▾ · Nadirlik · Float · A-Z · Tür · ızgara/liste anahtarı.
- Eşyaya dokun → detay (float çubuğu, desen #, fiyat, Sat / Upgrader'a gönder / Takasa ekle).
- Uzun bas → çoklu seçim, altta sabit "N sat · $X" çubuğu. Hızlı satış: "<$1", "<$5 sat".
- Boş durum: "Henüz eşya yok" + Kasalar'a git butonu.

### 3.7 Kontratlar sekmesi (iki alt sekme: GÜNLÜK | TAKAS)
- **Günlük:** sezon sayacı, yıldız çubuğu (örn. 31/50), yatay iki sıra ödül yolu (üst sıra ücretsiz kasa/nakit, alt sıra eşya/nakit), kilitli ödüller soluk + kilit. Günlük görevler: yıldız ödüllü 4 görev (ilerleme çubuğu + TAMAMLA butonu), gün sonu geri sayımı.
- **Takas:** mevcut Takas Kontratı, 10 yuvalı ızgara, "Otomatik doldur", sonuç ihtimalleri.

### 3.8 Oyunlar sekmesi
Büyük renkli kutular: **Upgrade**, **Takas**, **Coinflip**, **Case Battle (botlara karşı)**, **Tıklayıcı**. Kilitli olanlar seviye rozetiyle ("Sv.5'te açılır"), canlı bilgi satırı ("134 aktif savaş" yerine bot lobisi: "Rakip hazır").

### 3.9 Mağaza (sanal para ile, gerçek para YOK)
- **Günlük Çark** büyük kart (ödül değeri üstte, ÜCRETSİZ butonu, bugün kullanıldıysa geri sayım).
- Güçlendirmeler: Toplu Açma (200'e kadar, otomatik satlı), Otomatik Açıcı Pro, Çıkartma Sökücü (Faz 3). Fiyatlar oyun parası.
- Özelleştirme: avatar çerçevesi, profil afişi (Faz 2).

### 3.10 Profil
- Afiş + büyük seviye numarası + XP çubuğu (10.605 / 80.541 gibi).
- Ömür boyu toplamlar: kazanılan, harcanan, açılan kasa, en değerli drop.
- **Kasa koleksiyonu x/42**: her kasa için açılış sayısı, hiç açılmamış soluk.
- Ünvan şeritleri: "Kasa Ustası", "Whale", "Tedarikçi" gibi ilerleme çubuklu ünvanlar.
- Ayarlar: ses/titreşim, hızlı mod, sıfırla, adil-oyun doğrulama.

## 4. Oyun döngüsü (çekim gücü)

1. Aç → heyecan (şerit, ses, titreşim) → 2. Karar (tut/sat) → 3. Para ile yeniden aç → 4. Görev/yıldız/sezon ilerler → 5. Seviye atlar (ödül: nakit, 5 seviyede bir ücretsiz kasa) → 6. Yeni özellik açılır (Takas Sv.3, Upgrader Sv.5, Case Battle Sv.8, Coinflip Sv.10) → 7. Günlük geri dönüş sebebi (çark, supply drop, görevler).

**Para bitince:** ücretsiz kasalar, günlük görev nakdi, supply drop, çark, tıklayıcı. Asla "oyun bitti" olmaz.

## 5. Sayısal tasarım

- Başlangıç $50. Seviye XP: `40·n^1.15` (Sv.100'e uzun yol). Kasa açma XP: 30 + fiyat×15.
- Günlük görevler (havuzdan 4 rastgele): N kasa aç, N eşya sat, Upgrader'da kazan, Takas yap, N kez tıkla, Covert çıkar. Her biri 10–25 yıldız + nakit.
- Sezon: 50 basamak, basamak başına 5 yıldız (toplam 250 yıldız/sezon), 30 günlük. Ödül örnekleri: $5/$10/ücretsiz kasa ×N, 25. ve 50. basamakta nadir eşya.
- Supply Drop: 2 saatte bir; ödül $0.5–$3 veya 1–3 ücretsiz kasa.
- Günlük çark: 12 dilim, çoğu $0.5–$5, az $50, çok az $500+ ve altın eşya.
- Auto-sat eşiği varsayılan $0.50.
- Fiyat güncelleme: GitHub'da 3 saatte bir (Skinport), uygulama açılışta çeker; veri yoksa "~" tahmini fiyat.

## 5b. Teknik plan

- Yeni `src/theme.ts` (renk/boşluk/yazı), `src/components/*` (TopBar, ItemTile, Reel, ResultSheet, ProgressBar, Badge).
- Gezinme: alt sekmeler + her sekmede yığın (stack) ekranlar; Kasa detay ayrı ekran, üst barda geri.
- `Reel` bileşeni tekrar kullanılabilir: yükseklik, süre, sonuç eşya, tamamlanınca callback; 6 şerit aynı anda için görsel sayısı kısıtlı (şerit başına 40 öğe) ve `expo-image` önbellek.
- Store eklemeleri: `freeCases`, `missions`, `season`, `daily` (çark/supply drop zamanları), `perCase` açılış sayıları, `autoSell`/`autoSpin`/`quick` ayarları, `favs`.
- Kayıt sürümü `case-sim-save-v2`; eski kayıt otomatik taşınır.
- Testler: tip kontrolü, Metro paketleme, motor testleri, nadirlik oranı simülasyonu.

## 6. Fazlar

**Faz 1 (şimdi):** tema + 5 sekme + üst bar, kasa listesi, kasa detay, çoklu şerit, auto-sat, sonuç paneli, envanter, günlük görev + sezon yolu, Supply Drop, Günlük Çark, Oyunlar ızgarası (Upgrader, Takas, Coinflip, Tıklayıcı), Mağaza, Profil.
**Faz 2:** Case Battle (botlara karşı), Otomatik Açıcı, Toplu Açma, ünvanlar, çıkartma sistemi, avatar/afiş özelleştirme, yükleme ekranı cilası.
**Faz 3:** İsteğe bağlı mini oyunlar, bulut kayıt, sunucu tarafı çok oyunculu.

## 7. Riskler / notlar

- Telif: Valve markaları ve skin görselleri; "Valve ile bağlantılı değil" notu profil ve mağaza sayfasında.
- Play Store: simüle kumar 17+/18+; riskliyse APK doğrudan dağıtım.
- Büyük listeler: FlatList + sabit boyutlu öğeler, görsel önbellek.
