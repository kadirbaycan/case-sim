# DEPO — UX Spesifikasyonu

Bu belge `DEPO-TASARIM-PLANI-v3.md` (oyun, ekonomi, sistemler) ve `UX-PLAN.md` (referans analizi) dosyalarının yanında durur; onların yerine geçmez.
**Bu belgenin işi:** kullanıcının uygulamayı nasıl *kullanacağını* tarif etmek: kim, hangi bağlamda, hangi görevi, kaç dokunuşta, hangi durumlarla, hangi metinlerle, nasıl ölçülerek.

Referans uygulamalara dayanmaz. Kaynakları: (1) bu uygulamanın mevcut halinin denetimi, (2) oyun tasarım planı, (3) mobil kullanılabilirlik ilkeleri (Nielsen, WCAG 2.2, Material/HIG dokunma kuralları).

İçindekiler: 1 Denetim · 2 Kullanıcılar · 3 İlkeler · 4 Bilgi mimarisi · 5 Görev akışları · 6 Ekran spesifikasyonları · 7 Bileşenler · 8 Etkileşim kalıpları · 9 Sistem durumu ve hatalar · 10 İçerik ve metin · 11 Erişilebilirlik · 12 Hareket · 13 Duyarlı düzen · 14 Ölçüm ve test · 15 Uygulama planı

---

## 1. Mevcut uygulamanın UX denetimi

Kod ve ekran akışları üzerinden yapıldı (ciddiyet: 1 kozmetik · 2 küçük · 3 büyük · 4 engelleyici).

| # | Bulgu | Nerede | Etki | Ciddiyet | Çözüm (bölüm) |
|---|---|---|---|---|---|
| D1 | İkonlar emoji; cihaza göre farklı görünür, tutarsız boyut, ekran okuyucuda anlamsız | Sekme çubuğu, üst bar, çipler | Marka hissi yok, güvenilmez görünüm | 3 | Çizgi ikon seti (7) |
| D2 | Kasa açarken başka sekmeye/geri gidince animasyon kesilir, sonuç sheet'i hiç görünmez (eşya envantere düşmüş olur) | Kasa detay | Oyuncu çıkanı göremez, "kayıp" hissi | 4 | Açılış sahnesi kilitli, "Sonucu göster" garantisi (6.6) |
| D3 | Oto-sat eşiği yalnız ⚙ simgesinde saklı; anahtar açılınca hangi eşiğin geçerli olduğu görünmüyor | Kasa detay | Yanlışlıkla eşya satma | 3 | Anahtar altına durum metni "<$0.50 satılır" |
| D4 | Üç anahtar (Oto-Çevir/Oto Tut-Sat/Hızlı) yalnız renkle açık/kapalı anlatıyor | Kasa detay | Renk körü ve hızlı bakışta belirsiz | 3 | Etiket + durum sözcüğü "AÇIK/KAPALI" |
| D5 | Adet >6 seçilince animasyon sessizce atlanıyor | Kasa detay | Beklenmeyen davranış | 2 | Açıklayıcı satır "Toplu açma hızlıdır" |
| D6 | Sonuç sheet'inde "satmak için dokun" ifadesi ile seçim modeli karışık: dokunma seçiyor, satış başka düğmede | Sonuç sheet | Yanlış eşya satılır | 3 | Net seçim modeli (6.7) |
| D7 | "~" (tahmini fiyat) işareti hiç açıklanmıyor | Her yerde | Fiyata güven düşer | 3 | PriceText bileşeni + ipucu (7.9) |
| D8 | Profil, avatar emojisine dokununca açılıyor; keşfedilemez | Üst bar | Profil/sezon/ayar bulunamaz | 3 | Açık "Profil" girişi + Depo'da kart |
| D9 | Görevde ödül hazır rozeti yalnız Kontratlar sekmesinde | Alt bar | Hazır ödül unutulur | 2 | Depo ana kartı + sekme rozeti |
| D10 | Envanterde çoklu seçim yalnız uzun basma ile; ipucu yok | Envanter | Özellik keşfedilemez | 3 | "Seç" düğmesi + ilk kullanım ipucu |
| D11 | Yetersiz bakiye: yalnız toast; çözüm yolu yok | Kasa detay | Çıkmaz sokak | 3 | Eksik tutar + "Eşya sat/Vardiya topla" eylemleri |
| D12 | Coinflip "Hepsi" bahsi onaysız | Atölye | Tek dokunuşla tüm bakiye risk | 4 | Limit + basılı tut onayı (8.6) |
| D13 | Upgrade başarısızlığında eşya yanar; öncesinde değerli eşya için ek onay yok | Atölye | Geri alınamaz kayıp | 4 | Tutar eşikli onay (8.6) |
| D14 | Kilitli ekranlar yalnız "Seviye X'te açılır" diyor; ne yapılacağı yok | Takas/Upgrade | Motivasyon yok | 2 | Kilit kartı: kaç XP kaldı + nasıl kazanılır |
| D15 | Fiyat yenile yalnız Profil'in derininde; veri eskiyse haber verilmiyor | Profil | Eski fiyatla karar | 3 | Üst bar durum noktası + sheet |
| D16 | Yükleme ekranı en az 700 ms yapay bekletme yapıyor | Kasa detay | Gereksiz gecikme | 2 | Gerçek ilerleme; hazırsa 0 sn |
| D17 | Hiçbir etkileşimde erişilebilirlik etiketi/rolü yok (0 adet) | Tüm uygulama | Ekran okuyucu kullanılamaz | 4 | Bölüm 11 |
| D18 | Toast'lar üst üste biner, eylem içermez | Genel | Mesaj kaçar | 2 | Kuyruklu toast (7.6) |
| D19 | Hata/boş durumlar tutarsız (kimi yerde metin, kimi yerde boşluk) | Genel | Kafa karışıklığı | 2 | EmptyState bileşeni (7.12) |
| D20 | Satış geri alınamaz | Envanter/Sonuç | Pişmanlık | 3 | 5 sn geri al (8.5) |
| D21 | Tüm önemli eylemler ekranın üst/orta bölgesinde (kaydırmayla kayıyor) | Birçok ekran | Tek el erişimi zayıf | 2 | Alt eylem çubuğu kuralı (3, 6) |
| D22 | Aynı bilgi birden fazla yerde farklı biçimde (fiyat $2.5 / $2.50 / $2.5) | Genel | Tutarsızlık | 1 | Biçim kuralları (10.3) |

**Ortak sonuç:** uygulama "çalışıyor" ama *neden bu işlem oldu, ne kaybettim, geri alabilir miyim, sıradaki ne* sorularının cevabını vermiyor. Bu belge bunları kapatmak için yazıldı.

---

## 2. Kullanıcılar

### 2.1 Bağlam varsayımları
- Telefon, dikey, çoğunlukla **tek el** (başparmak bölgesi alt %40).
- Kısa kesintili oturumlar (otobüs, mola, sıra bekleme); uygulama sık arka plana atılır.
- Çevrimiçi bağlantı kararsız olabilir (4.5G); fiyat verisi yoksa oyun yine oynanmalı.
- Parlak ışık/karanlık: koyu tema varsayılan, yüksek kontrast.
- Çocuk/genç oyuncu ihtimali yüksek: sorumlu oyun ve açık dil şart.

### 2.2 Personalar (kısa)
| Persona | Hedef | Sinir noktası | Tasarım sonucu |
|---|---|---|---|
| **Emre, 17, "açma tutkunu"** | Hızlı, çok kasa, nadir çıkarma | Beklemek, yavaş animasyon, menü labirenti | Hızlı mod, oto-çevir, 2 dokunuşta açma |
| **Zeynep, 24, "koleksiyoncu"** | Tüm skin'leri toplamak | Neyi eksik bilmemek | Albüm, eksik göstergesi, siparişler |
| **Burak, 31, "piyasa meraklısı"** | Fiyat izlemek, yatırım | Eski/belirsiz veri | Veri tazeliği, grafik, uyarılar |
| **Deniz, 40, "rahat oyuncu"** | Günde 5 dk, huzurlu | Karmaşıklık, jargon | Depo ana ekranı, sade dil, büyük yazı |

### 2.3 Yapılacak işler (JTBD)
1. "Boş vaktimde **heyecan** yaşamak istiyorum." → kasa açma.
2. "Elimdekinin **ne kadar ettiğini** bilmek istiyorum." → envanter değeri, fiyatlar.
3. "Bir hedefe **yaklaştığımı** görmek istiyorum." → albüm, sezon, görev.
4. "Para yitirmeden **akıllı** oynamak istiyorum." → RTP, piyasa, karne.
5. "Uygulamayı açınca **ne yapacağımı** bilmek istiyorum." → Depo.

---

## 3. UX ilkeleri (bu uygulamaya özgü 10 kural)

1. **Bir ekran, bir karar.** Her ekranda tek birincil eylem (amber), en fazla bir ikincil.
2. **Para hareketi asla sessiz değildir.** Bakiye değiştiren her işlem (a) ne kadar, (b) neden, (c) yeni bakiye bilgisini gösterir ve Para Geçmişi'ne yazılır.
3. **Geri alınamayanı önceden söyle.** Geri dönüşsüz işlemler ya geri alma penceresi (5 sn) ya da basılı tutma onayı taşır (8.5–8.6).
4. **Heyecan sunumdadır, bilgi dürüsttür.** Animasyon süslenebilir; olasılık, sonuç ve fiyat asla gizlenmez/manipüle edilmez.
5. **Çıkmaz sokak yok.** Hata ya da engel varsa yanında bir sonraki eylem vardır ("Eksik $0.80 → Eşya sat").
6. **Kritik eylemler başparmak bölgesinde.** Birincil düğmeler alt bölge; üst bölge bilgi.
7. **Önce göster, sonra sor.** Varsayılan akıllı olsun (örn. en son kasa, son adet); ayar sorusu en aza insin.
8. **Durum her zaman görünür.** Çevrimdışı, eski veri, yükleniyor, kilitli: hiçbiri sessiz değil.
9. **Kısa yol keşfedilebilir olsun.** Uzun basma/kaydırma gibi gizli kısa yollar mutlaka görünür bir karşılık taşır.
10. **Her şey durdurulabilir.** Animasyon atlanır, oto-çevir durdurulur, tur sonuçlandığında oyuncu kontrolü geri alır.

---

## 4. Bilgi mimarisi ve gezinme

### 4.1 Site haritası
```
DEPO (sekme 1)
 ├ Akıllı öneri · Vardiya · Supply · Seri · Hedefler · Piyasa nabzı · Siparişler önizleme
KASALAR (sekme 2)
 ├ Raf/Liste
 │  └ Filtre & sırala (sheet)
 └ Kasa detay
    ├ [İçerik] [Olasılık] [Geçmiş]
    ├ Açılış sahnesi (tam ekran, kilitli)
    └ Sonuç (sheet)
KASAM (sekme 3)
 ├ [Eşyalar] → Eşya detayı (Float Lab) sheet
 ├ [Albüm] → Koleksiyon sayfası → Yuva detayı
 └ [Mühürlü] → Stok yönetimi
PİYASA (sekme 4)
 ├ [Nabız] → Kasa/eşya fiyat detayı (grafik)
 ├ [Borsa] → Al/Sat sheet, Portföy
 └ [Siparişler] → Bayi → Sipariş detayı → Teslim
ATÖLYE (sekme 5)
 ├ Upgrade · Takas · Coinflip
Profil (üst bardan; tam ekran sayfa)
 ├ Kart · Sezon · Görevler · Karne · Başarımlar · Ayarlar · Hakkında
Global sheet'ler: Para geçmişi, Veri durumu, Bildirim kuyruğu
```

### 4.2 Gezinme kuralları
- **Derinlik en çok 3 seviye** (sekme → liste → detay). Daha derinse sheet kullanılır.
- Sekme çubuğu her zaman görünür, **istisna:** açılış sahnesi ve tam ekran onay.
- Aktif sekmeye tekrar dokun → kök ekran + listede başa kaydır.
- Sekme değişince **konum korunur** (kaydırma, filtre); 10 dk hareketsizlikte sıfırlanır.
- Donanım geri: sheet → alt ekran → Depo → "Çıkmak için tekrar bas" (2 sn). Açılış sahnesinde geri **devre dışı** (atla düğmesi vardır).
- Üst bar: sol geri/başlık, sağ bakiye. Bakiye dokununca Para Geçmişi.
- **Rozet politikası:** yalnız "alınabilir ödül" ve "yeni sipariş" için rozet; sayı gösterir; görüldüğünde söner.

### 4.3 Derin bağlantı ve durum geri yükleme
- Uygulama arka plandan dönünce aynı ekran; hafızadan atılmışsa Depo + "Kaldığın yerden devam" kartı (son kasa).
- Bildirim → ilgili ekran: `kasa/:id`, `siparis/:id`, `piyasa/:id`, `sezon`.

---

## 5. Görev akışları

Her akış: **hedef dokunuş sayısı** (bütçe), adımlar, hata yolları. Bütçe aşılırsa tasarım hatasıdır.

### F1. Bir kasa aç (en sık görev)
Başlangıç: Depo. **Bütçe: 2 dokunuş** (kasa seç, aç).
1. Depo'da öneri kartı "Fever Case'i aç" → **kasa detayına** (1. dokunuş, doğrudan öneri düğmesi).
2. "Kilidi aç" (2. dokunuş).
3. Şerit, sonuç sheet'i.
4. Devam: "Tekrar aç" (1 dokunuş) veya kapat.
Hata yolları: bakiye yetersiz → "Eksik $0.80" + [Eşya sat] [Vardiya topla]; fiyat verisi yok → "~ tahmini fiyat" uyarısı + yine de açılabilir; çevrimdışı → normal çalışır, üst barda "Fiyatlar 5 sa önce".

### F2. Çıkan eşyayı sat
**Bütçe: 1 dokunuş.** Sonuç sheet'inde "Hepsini sat" (tek). Tekil eşya → "Sat $X". 5 sn **Geri al** snackbar'ı.

### F3. Envanteri temizle (çok eşya sat)
**Bütçe: 3 dokunuş.** Kasam → "Akıllı seçim ▾ → En ucuz 20" → "Sat". Onay: toplam tutar ve eşya sayısı özet sheet'inde; ≥$50 toplamda basılı tut onayı.

### F4. Eşya incele (Float Lab)
Kasam → eşya kartına dokun (1 dokunuş). Sheet %60 açılır; yukarı çek → %92 tam.

### F5. Albüm yuvası doldur
Kasam → Albüm → kasa sayfası → eksik yuva (silüet) → "Bunu nasıl bulurum?" sheet → "Bu kasayı aç" (4 dokunuş), kutlama.

### F6. Bayi siparişini teslim et
Depo → siparişler kartı → bayi → "Uygun eşyam var" listesi (envanter filtreli) → eşya seç → "Teslim et" (4 dokunuş). Prim özeti gösterilir; geri alınamaz (basılı tut onayı ≥$30).

### F7. Mühürlü kasa al/sat (borsa)
Piyasa → Borsa → kasa → "Al" sheet'i (adet stepper, toplam, spread notu) → "Onayla" (4 dokunuş). Veri >12 sa eskiyse düğme pasif + neden yazısı.

### F8. Upgrade
Atölye → Upgrade → eşya seç → hedef seç → "Yükselt" (4 dokunuş). Değer ≥$30 ise basılı tut onayı, sonucu göstermeden önce animasyon.

### F9. Takas
Atölye → Takas → "Otomatik doldur" → sonuçları gör → "İmzala" (4 dokunuş).

### F10. Para bitti kurtarma
Tetik: bakiye < en ucuz kasa. Depo'da öneri kartı otomatik: sırayla (a) satılabilir eşya varsa "Rafta $X'lık eşya var → Sat", (b) vardiya birikmiş ise "Vardiyayı topla", (c) ücretsiz kasa, (d) "Vardiya avansı $5" (günde 3). Hiçbir durumda kilitlenme yok.

### F11. Otomatik çevir kur
Kasa detay → anahtarı aç → durum satırı "Oto-çevir AÇIK · $0.50 altını sat · kırmızı/altında durur" → "Kilidi aç". **Bütçe: 3 dokunuş.** Sınırlar görünür; ilk kullanımda bir kez açıklayıcı sheet.

### F12. Fiyatları yenile / veri durumu
Üst bardaki **veri noktası** (yeşil: taze, sarı: >6 sa, kırmızı: >12 sa/yok) → sheet: "Son güncelleme 2 sa 14 dk önce · 9923 fiyat" + [Yenile]. **Bütçe: 2 dokunuş.**

### F13. Yedekle / geri yükle
Profil → Ayarlar → Veri → "Dışa aktar" (paylaş menüsü) / "İçe aktar" (dosya seç) → özet önizleme ("Sv.12, 340 eşya, $412") → "Geri yükle" (mevcut kayıt silinir uyarısı, basılı tut).

### F14. İlk açılış
Bölüm 6.1.

---

## 6. Ekran spesifikasyonları

Düzen birimi **dp**. Referans cihaz: **360 × 800**. Üst bar 56, alt sekme çubuğu 64 (güvenli alan hariç). Kenar boşluğu 16. Kart arası 8. Tüm ölçüler `theme/tokens.ts` içinde.

Her ekran için başlıklar: **Amaç · Girişler · Düzen · Durumlar · Etkileşim · Geri bildirim · Metin · Kenar durumlar · Ölçüt**.

### 6.1 Açılış ve ilk kullanım (S0–S1)
**S0 Splash/Yükleme.** Logo 1.2 sn; arka planda: yazı tipleri, kayıt, fiyat önbelleği. **Gerçek** ilerleme; 4 sn aşılırsa "Hâlâ hazırlanıyor… Offline devam" bağlantısı.
**S1 Hoş geldin (tek ekran, 3 madde).**
```
┌ 56 ──────────────────────────┐
│ (boş)                        │
│  GECE VARDİYASI              │ ← 40/44 başlık
│  Depoya hoş geldin.          │
│  ▸ Kasa aç                   │
│  ▸ Sat, sakla, topla         │
│  ▸ Piyasayı oku, büyü        │
│                              │
│ [ HEDİYE KASAYI AÇ ]  56     │ ← alt bölge
│ Eğitimi atla                 │ ← 44 metin düğmesi
└──────────────────────────────┘
```
- Hediye kasa "Başlangıç hediyesi · en az Restricted garantili" etiketi (**özel olasılık, açıkça yazılı**).
- İlk eşya sonrası sheet: "Sat ($X)" / "Tut". İpucu balonu: "Sattığında bakiyene eklenir."
- Sonra Depo; bir **koçluk katmanı** sırayla 3 ipucu gösterir (tek cümle, tek kez): RTP rozeti, kasa adet seçici, günlük hedefler. "İpuçlarını yeniden göster" ayardan.

### 6.2 DEPO (S2)
Amaç: 3 sn'de sonraki hamle; geri dönüş nedenlerini tek yerde toplamak.
Düzen (kaydırılabilir, soldan sağa tek sütun):
| Bölge | Yükseklik | İçerik |
|---|---|---|
| Üst bar | 56 | Seviye halkası · başlık · veri noktası · bakiye |
| **Öneri kartı** | 144 | Başlık (20), alt satır (14), birincil düğme (56) |
| Vardiya kartı | 88 | Birikmiş süre, tutar, [Topla] 44 |
| 2'li satır | 96 | Supply (geri sayım) · Seri (7 nokta) |
| Siparişler | 132 | Yatay kaydırma; bayi kartı 240×108 |
| Hedefler | 40+3×56 | İlerleme çubukları, [Al] düğmesi |
| Piyasa nabzı | 3×44 | Üç hareketli kasa, ▲▼ yüzde |
Durumlar: taze kurulum (öneri = ilk kasa), ödül var (öneri = ödül), çevrimdışı (veri noktası sarı, nabız kartı "Veri eski"), yükleniyor (iskelet 300 ms üstünde).
Etkileşim: her kart dokununca derin bağlantı; öneri kartı aşağı çekilince **yenile** (fiyat + vardiya).
Geri bildirim: Topla → para uçuşu (kart→bakiye 450 ms) + `coin` sesi + hafif titreşim.
Kenar: tüm bölgeler boş olsa bile ekran "boş" görünmez; her bölgenin kendi boş cümlesi vardır ("Henüz sipariş yok. Bayiler akşam gelir.").
Ölçüt: etkileşime hazır ≤1.5 sn; öneri düğmesi hedefe ≤2 dokunuşla.

### 6.3 KASALAR — raf (S3) ve Filtre sheet (S4)
Düzen: arama alanı 48 (yapışkan) · görünüm anahtarı [Raf|Liste] · **hızlı çipler** (Hepsi, Ucuz, İyi RTP, Yeni, ★) · kasa ızgarası (3 sütun, kart 104×156) · alt: "Filtre" yüzen düğmesi (sağ alt, 48).
Kart anatomi (104×156): görsel 80×68 · ad (2 satır, 13) · fiyat (14, mono) · RTP rozeti (sol üst, renk+sembol+%) · trend oku (sağ üst) · ücretsiz stok rozeti (alt şerit).
Liste görünümü: satır 64: görsel 48, ad+alt satır (RTP · 24 sa), sağda fiyat.
**Filtre sheet (%60):** Sırala (Önerilen · Fiyat ↑↓ · RTP ↓ · Yeni · Emekli) · İçerik (bıçak/eldiven içeren) · Durum (ücretsiz stoklu, favori) · [Uygula (N kasa)] [Sıfırla].
Etkileşim: uzun basış → hızlı menü (Favori, Grafik, İçerik); **aynı menüye** kartta "⋯" düğmesi de bağlı (D10 ilkesi, keşfedilebilirlik).
Boş: "Bu filtrede kasa yok → [Filtreyi temizle]".
Metin: RTP ipucu (ilk dokunuşta): "Bu kasa uzun vadede açılış maliyetinin yaklaşık %30'unu geri verir."

### 6.4 KASA DETAY (S5)
Düzen (360×800):
| Bölge | y (dp) | İçerik |
|---|---|---|
| Üst bar | 0–56 | Geri, kasa adı kısa, bakiye |
| Sahne | 56–260 | Kasa görseli (yüzer) / şerit(ler) |
| Bilgi satırı | 260–296 | RTP rozeti · fiyat trendi · ücretsiz stok |
| İçerik alanı | 296–… | Alt sekmeler + kaydırılan içerik |
| **Eylem çubuğu (yapışkan, alt)** | −168…0 | Adet seçici (44) · [Kilidi aç] (56) · maliyet satırı (20) |
Eylem çubuğu içerik kaydırılırken bile görünür (D21). Ayar anahtarları, çubuğun **üstünde ince şerit** halinde: `[Oto-çevir KAPALI] [Oto-sat <$0.50] [Hızlı KAPALI]` (etiketli çipler; dokununca değişir, uzun basış/⚙ ayarı açar).
Alt sekmeler: **İçerik · Olasılık · Geçmiş** (Segmented, 40).
- **İçerik:** nadirlik grubu başlığı (renk+sembol+ad+%) + 3 sütun kart (görsel, ad, **fiyat aralığı**, düşme %). Dokun → Eşya bilgi sheet'i.
- **Olasılık:** yığılmış çubuk (nadirlik renkleri, sembol), altında tablo; "Beklenen değer $X · Maliyet $Y · **Tahmini geri dönüş %Z**" cümlesi; "Senin sonuçların: beklenenin %112'si" satırı (Karne).
- **Geçmiş:** son 50 açılış şeridi (renkli küçük kareler), toplamlar, en iyi drop.
Durumlar: yükleme (görsel iskeleti, **gerçek** ilerleme; hazırsa 0 ms); fiyat yok ("~" + [Fiyatları yenile]); yetersiz bakiye (düğme pasif DEĞİL; dokununca "Eksik $0.80" sheet'i: [Eşya sat] [Vardiya topla] [Ucuz kasa öner]).
Etkileşim: adet seçici — dokun; sürükle (başparmak kaydırır, 1-6 arası); tıklayınca titreşim. Sahnedeki kasaya dokun → hafif sarsılır (merak/ipucu), işlevsiz.
Metin: düğme "Kilidi aç" (adet 1), "3 kasa aç" (adet >1), maliyet satırı "Anahtar + Kasa $2.99 · Bakiye sonra $47.01".
Ölçüt: açma için 2 dokunuş; maliyet ve bakiye sonrası değer görünür.

### 6.5 AÇILIŞ SAHNESİ (S6) — kilitli tam ekran
- Sekme çubuğu gizlenir, geri devre dışı; sağ üstte **[Atla]** (44) her an aktif.
- Süre ve efektler: `DEPO-TASARIM-PLANI-v3.md` Bölüm 4.4 tablosu.
- **Duruş sonrası** değişmez sonuç kartı: ad, nadirlik (renk+sembol), float, fiyat.
- Çoklu şerit: alt alta; **ekran okuyucu** için sahne özeti (tüm sonuçlar) animasyon sonunda tek cümlede okunur.
- Uygulama arka plana alınırsa: sonuç zaten kaydedildi; dönüşte **Sonuç sheet'i** otomatik açılır (D2 çözümü). Sonuç, animasyondan **önce** hesaplanır ve kalıcı yazılır; sahne yalnız gösterimdir.

### 6.6 Garanti: "Sonucu göster"
Sonuç yazıldıktan sonra uygulama kapansa bile açılışta Depo'da kart: "Açılmamış sonuç: Fever Case · ★ Butterfly (gör)". Hiçbir sonuç görünmeden kaybolmaz.

### 6.7 SONUÇ SHEET (S7)
Düzen: tutamak · başlık (örn. "3 eşya çıktı") · yan not ("2 eşya otomatik satıldı +$0.62") · kart ızgarası (tek: büyük; çoklu: 2 sütun) · **alt eylem çubuğu**.
**Seçim modeli (D6):** kartların köşesinde **onay kutusu** her zaman görünür. Varsayılan hiçbiri seçili değil. Dokunma = seçim (kutu işaretlenir); uzun basış = detay. 
Eylem çubuğu: sol ikincil [Tut] (kapatır), sağ birincil **dinamik**: seçim yoksa **[Hepsini sat $X]**, seçim varsa **[Seçilenleri sat $Y]**. Altında "Tekrar aç ×N" metin düğmesi.
Etiketler: "YENİ REKOR", "Albüm: yeni parça!", "Siparişe uygun".
Satış sonrası: **Geri al** snackbar'ı (5 sn): "3 eşya satıldı +$18.40 · [Geri al]".
Kenar: hepsi otomatik satıldıysa sheet "Otomatik satıldı: 5 eşya +$1.21" kısa özetle 1.2 sn görünüp kapanır (oto-çevir açıksa).

### 6.8 EŞYA DETAYI — Float Lab (S8)
Sheet %60 → yukarı çekince %92.
| Bölge | İçerik |
|---|---|
| Görsel | 200dp yükseklik, **iki parmakla yakınlaştır** |
| Başlık | Ad (20), nadirlik rozeti (renk+sembol+ad) |
| **Float şeridi** | 0–1 beş renkli bölge; ibre; skin'in mümkün aralığı gri bant; altında "FN içinde %12 · düşük float" |
| Fiyat paneli | Güncel fiyat (mono, büyük), "~" varsa ipucu; satış değeri %90; mini grafik (30 gün, varsa) |
| Detay satırları | Desen #, ST, çarpan açıklaması, nereden çıktı, açılış tarihi |
| Eylem çubuğu | [Sat $X] (birincil) · [Atölye ▾ Upgrade/Takas] · [⋯ Vitrine, Siparişe] |
Kenar: özel desen (Blue Gem, Doppler fazı) → "Özel desen · fiyat çarpanı x40" altın çerçeve. Fiyat eski → "Fiyat 9 sa önce".

### 6.9 KASAM (S9–S11)
**Üst:** [Eşyalar | Albüm | Mühürlü] (Segmented 40) · arama 44 · toplam değer + 24 sa değişim.
**Eşyalar:** çipler (yatay kaydırma); görünüm anahtarı; **"Seç" düğmesi** (açık, D10): seçim modunda üst çubuk "3 seçili · [Hepsi] [İptal]", alt eylem çubuğu **[Sat $X] [Takasa] [⋯]**. "Akıllı seçim" menüsü: En ucuz 10/20, Tekrarlar, <$1, <$5, Siparişe uygun.
Kart: 112×150 (3 sütun) ya da liste satırı 64. Seçim kutusu seçim modunda belirir.
**Albüm:** kasa sayfaları listesi; her satır 72: görsel, ad, ilerleme çubuğu + "42/85", eksik 1 ise altın rozet. Sayfada: bölüm başlıkları (nadirlik) → yuva ızgarası 4 sütun; dolu yuva renkli, boş silüet + fiyat; yuvaya dokun → "Bunu nasıl bulurum?" sheet'i ([Bu kasayı aç], [Piyasada ara]).
**Mühürlü:** kart listesi (görsel, adet, maliyet, güncel değer, K/Z ▲▼); [Aç] (anahtar ücretiyle) [Sat] eylemleri.
Boş: "Raflar boş. [Kasalara git]".

### 6.10 PİYASA (S12–S15)
**Nabız:** endeks grafiği (160 dp, 24s/7g/30g segmenti) · "En çok yükselen" ve "düşen" listeleri (3'er) · fırsat kartı · veri tazelik şeridi.
**Borsa:** portföy özeti (maliyet, değer, K/Z) · kasa listesi (satır 64: görsel, ad, güncel fiyat, 24 sa %, [Al]).
**Al/Sat sheet:** adet stepper (44×44 düğme, uzun basışla hızlı artış), alış/satış fiyatı, **spread** açık yazı, toplam, bakiye sonrası, [Onayla]. Veri eskiyse düğme pasif + açıklama.
**Siparişler:** liste (bayi avatarı, ad, istek özeti, süre, prim); detay: istenen eşya görseli, koşullar, "Uygun eşyalarım" listesi, **prim hesabı satırı**, [Teslim et] (≥$30 basılı tut).
Boş: "Şu an açık sipariş yok. Bayiler genelde akşam gelir."

### 6.11 ATÖLYE (S16–S19)
Hub: üç büyük kart (kilitliyse kilit kartı: "Sv.5 için 320 XP kaldı · Kasa açarak kazan").
**Upgrade:** 1) girdi seçimi, 2) hedef listesi (çarpan çipleri), 3) şans halkası + [Yükselt]. Yükselt altında "Kazanma şansı %24.5 · Ev payı %5 · Kaybedersen eşya yanar". Değer ≥$30: basılı tut. Sonuç: tam ekran kutlama/kayıp (kayıpta "Bir dahaki sefere" ve **Kayıp özeti**).
**Takas:** 10 yuva halkası; her yuva 56×56; "Otomatik doldur" (en ucuz 10); sonuç tablosu; "İmzala" için **imza hareketi** (parmakla çizgi çek, 400 ms) → onay.
**Coinflip:** bahis çipleri (0.5, 1, 5, 10, 25); **"Yarısı"** ve **"Maks (%50)"** (bakiyenin yarısı); yazı/tura; kaybetme serisi ≥5 → "Mola?" kartı.
Ortak: ekran üstünde "Sanal para" etiketi, altında oturum özeti (kazanç/kayıp).

### 6.12 PROFİL (S20–S23)
Tam ekran sayfa (alttan açılır, kapat 44 sol üst). Üst sekmeler: **Kart · Sezon · Karne · Ayarlar**.
- **Kart:** seviye halkası + XP, vitrin (3 slot), ünvanlar, başarımlar özeti.
- **Sezon:** 50 basamak, iki şerit; alınabilir ödül varsa üstte "3 ödül hazır [Hepsini al]".
- **Görevler:** Depo'dakinin tam hali + haftalık.
- **Karne:** beklenen/gerçek grafik, net değer eğrisi, defter.
- **Ayarlar:** Ses (efekt, titreşim ayrı) · Görünüm (hareketi azalt, yazı boyutu, renk körü modu, ikon+renk) · Oyun (oto-çevir sınırları, onay eşikleri, mola) · Veri (yedekle/içe aktar, fiyat durumu) · Gizlilik/Hakkında ("Sanal para, Valve ile bağlantı yok") · Tehlikeli bölge (sıfırla, iki aşamalı).

### 6.13 Global sheet'ler ve sistem ekranları
- **Para geçmişi:** son 30 işlem; satır: ikon, açıklama ("Fever Case ×3"), tutar (renkli), saat; filtre (gelir/gider); toplam özet.
- **Veri durumu:** nokta açıklaması, [Yenile], kaynak, öğe sayısı, "Neden önemli?" tek cümle.
- **Çevrimdışı şeridi:** üst barın altında ince şerit "Çevrimdışı · fiyatlar 5 sa önce"; kapatılamaz ama 24 sa'da bir tek kez kendiliğinden küçülür.
- **Hata ekranı (genel):** ikon, bir cümle, [Tekrar dene], [Depo'ya dön]; teknik ayrıntı genişleyen bölüm ("Ayrıntıları kopyala").

---

## 7. Bileşen spesifikasyonları

Her bileşen: anatomi · ölçü · durumlar · davranış · erişilebilirlik.

### 7.1 Button
- Boyut: **L 56** (birincil, tam genişlik), **M 44** (ikincil), **S 36** (satır içi, yalnız yoğun listelerde; dokunma alanı hitSlop ile 44'e tamamlanır).
- Türler: Birincil (amber dolgu, koyu metin), İkincil (çizgi, açık metin), Yıkıcı (kırmızı çizgi; onay gerektirir), Metin.
- Durumlar: normal · basılı (ölçek 0.97, 90 ms) · pasif (%38 opaklık **+ neden metni**) · yükleniyor (spinner, metin sabit genişlik) · başarı (✓ 400 ms).
- Pasif düğme **asla sessiz** olmaz: üstünde/altında "neden" satırı veya dokununca açıklama (İlke 5).
- Erişilebilirlik: rol `button`, etiket eylem+nesne ("Kilidi aç, Fever Case, 2.99 dolar").

### 7.2 Hold-to-confirm (basılı tut)
Yıkıcı/geri dönüşsüz işlemler. 800 ms dolan halka; bırakılırsa iptal; titreşim artar; tamamlanınca `heavy`. Erişilebilirlik alternatifi: çift dokunma + onay iletişim kutusu (ayar: "Basılı tutma yerine onay penceresi").

### 7.3 Chip
Yükseklik 36, dokunma 44. Seçili: dolgu `bg.2` + `info` çerçeve + onay işareti (**renk tek başına değil**). Çoklu seçimde sayı rozeti.

### 7.4 Toggle (etiketli)
Anahtar 52×28 + **durum sözcüğü** ("AÇIK/KAPALI") + etiket. Altında tek satır açıklama (isteğe bağlı). Dokunma alanı satırın tamamı (≥56).

### 7.5 Segmented
Yükseklik 40, her bölüm ≥72 genişlik, kaydırma hissi 160 ms; seçili bölümün altı amber çizgi + yazı beyaz/kalın.

### 7.6 Toast / Snackbar
- **Tek aktif**, kuyruk (en çok 3), 3 sn (eylemli 5 sn). Konum: üst bar altı (içerik kaydırmaz), güvenli alan içinde.
- Türler: bilgi, başarı, hata, **eylemli** (Geri al/Git).
- Aynı mesaj tekrarlanırsa birleşir ("+3").
- Erişilebilirlik: `liveRegion=polite`.

### 7.7 Sheet
Tutamak 40×4, köşe 20, arka plan karartma %60. Snap: %45/%60/%92; aşağı sürükleyerek kapanır; geri tuşu kapatır; içerik kaydırılabilirken yukarı sürükleme önce içeriği kaydırır. **Yıkıcı işlemde** sürükleyerek kapanma kapalı.

### 7.8 Dialog (yalnızca zorunlu)
Başlık (soru), tek cümle sonuç, **iki düğme** (ikincil sol/birincil sağ), yıkıcıysa kırmızı. Kullanım nadir; mümkünse Geri al tercih edilir.

### 7.9 PriceText
Mono, tabular. Biçim: `$1,284.50` (≥1000), `$38.20`, `$0.06`. **Tahmini** ise başında `~` + ipucu (dokununca "Bu eşya için piyasa verisi yok; benzer eşyalara göre tahmin"). Eski ise sağında sarı nokta + "9 sa önce". Değişim: `▲ +3.20` gain / `▼ −1.10` loss.

### 7.10 RarityBadge
Renk **+ sembol + ad**: Mil-Spec ●, Restricted ◆, Classified ▲, Covert ■, Nadir ★. Küçük (yalnız sembol+renk) ve büyük (ad dahil) boyut. Ekran okuyucu adı okur.

### 7.11 FloatBar, Sparkline, Skeleton, Counter
- **FloatBar:** 5 bölge, ibre 4dp; değer etiketi ibreyle birlikte; erişilebilirlik "Factory New, float 0.012".
- **Sparkline:** 120×32, tek çizgi, son nokta vurgulu; veri yoksa "Veri yok" çizgisi kesikli.
- **Skeleton:** gri blok + 1.2 sn kayan parlama; yalnız >300 ms beklemede görünür.
- **Counter:** sayı sayma 600 ms; hareketi azalt açıkken anında.

### 7.12 EmptyState
İkon (çizgi, 48), **bir cümle**, tek eylem. Ton: kuru ve yardımcı. Her listenin boş metni **bu belgenin 10. bölümünde** tanımlı.

### 7.13 Stepper
44×44 `−`/`+`, ortada değer (mono, 20). Basılı tutma: 400 ms sonra hızlanarak artar; üst/alt sınırda titreşim ve pasif.

---

## 8. Etkileşim kalıpları

### 8.1 Hareket haritası (gesture)
| Hareket | Davranış | Görünür karşılık |
|---|---|---|
| Dokun | Birincil eylem | — |
| Uzun bas (500 ms) | Seçim/hızlı menü | "⋯" ve "Seç" düğmesi **her zaman** var |
| Aşağı çek | Yenile (Depo, Piyasa) | Çekme göstergesi |
| Sağa/sola kaydır | Yatay liste (siparişler) | Kenar kesilmiş kart (kaydırılabilir izlenimi) |
| Çift dokun | Yok (karışıklık yaratır) | — |
| İki parmak | Yalnız eşya görseli zoom | — |
| Sürükle | Sheet, adet seçici | Tutamak |

### 8.2 Haptik sözlüğü
`tick` (10 ms) seçim/adet; `light` (15 ms) düğme; `success` (30 ms) ödül; `warn` (40-30-40) onay gerektirir; `heavy` (60 ms) kayıp/kritik; nadirlik desenleri v3 Bölüm 4.4. Titreşim ayrı anahtar; **ardışık titreşimler 25 ms'den sık olmaz**.

### 8.3 Ses sözlüğü
Etkileşimler 6 ses: `tap`, `unlock`, `tick`, `coin`, `win(1-5)`, `lose`. Hiçbir ses 1.5 sn'yi geçmez (altın hariç 2.2 sn). Sistem sessizse çalmaz.

### 8.4 Varsayılanlar ve bellek
Son seçilen adet, filtre, sıralama, görünüm, ayar eşikleri **hatırlanır**. Ancak **oto-çevir ve oto-sat her oturumda KAPALI** başlar (güvenlik).

### 8.5 Geri alma politikası
| İşlem | Geri alma |
|---|---|
| Eşya sat (tekil/çoklu) | 5 sn snackbar **Geri al** (para ve eşya iade) |
| Mühürlü kasa sat | 5 sn |
| Favori/vitrin | Anında tersine çevrilebilir |
| Kasa aç, Upgrade, Takas, Coinflip | **Geri alınamaz** (bunlar sonuç üretir) |
| Sipariş teslimi | **Geri alınamaz** (basılı tut) |

### 8.6 Onay eşikleri (hata önleme)
| İşlem | Tek dokunuş | Basılı tut | Metinli onay |
|---|---|---|---|
| Satış < $30 | ✓ | | |
| Satış ≥ $30 (toplam) | | ✓ | |
| Upgrade girdi ≥ $30 | | ✓ | |
| Takas imzası | imza çizimi | | |
| Coinflip bahsi > bakiyenin %25'i | | ✓ | |
| Sıfırla | | | "SIFIRLA" yaz |
Eşikler Ayarlar'da yarıya inebilir/artabilir; varsayılan güvenli yön.

### 8.7 Ipucu ve keşfedilebilirlik
İlk kullanımda tek cümlelik "coach mark" (altı çizili hedef + "Anladım"); **gösterilen ipuçları kaydedilir**, Ayarlar'dan sıfırlanır. En çok 1 ipucu/oturum.

---

## 9. Sistem durumu, yükleme ve hatalar

### 9.1 Yükleme kuralları
| Süre | Davranış |
|---|---|
| < 100 ms | Hiçbir şey |
| 100–300 ms | Düğmede kısa spinner |
| 300–1000 ms | Skeleton |
| > 1 sn | Skeleton + metin ("Fiyatlar yükleniyor…") |
| > 4 sn | İlerleme çubuğu varsa göster; yoksa [Çevrimdışı devam] bağlantısı |

### 9.2 Hata kataloğu
| Durum | Kullanıcıya metin | Eylem |
|---|---|---|
| Ağ yok | "Çevrimdışısın. Oyun devam eder, fiyatlar eski olabilir." | [Tamam] |
| Fiyat dosyası bozuk | "Fiyat verisi okunamadı. Son geçerli veriyi kullanıyorum." | [Tekrar dene] |
| Fiyat verisi >12 sa | "Fiyatlar 14 saattir güncellenmedi. Borsa kapalı." | [Yenile] |
| Kayıt okunamadı | "Kayıt dosyası bozuk görünüyor. Yedekten geri yükleyebilirsin." | [Yedekten yükle] [Yeni başla] |
| Bakiye yetersiz | "Eksik $0.80." | [Eşya sat] [Vardiya topla] |
| Envanter dolu (varsa limit) | "Raflar dolu (1000/1000)." | [Eşya sat] [Albüme işle] |
| Sipariş süresi doldu | "Selin bu siparişi başkasına verdi." | [Tamam] |
| Zaman geri alındı | "Saat geri oynatılmış. Vardiya geliri bu oturum durduruldu." | [Tamam] |
| Beklenmeyen | "Bir şey ters gitti. Bir daha dene." | [Tekrar dene] [Ayrıntılar] |

### 9.3 Çevrimdışı mimari
Oyun **çevrimdışı çalışır** (yerel RNG, yerel kayıt). Çevrimiçi gerektiren tek şey fiyat güncellemesi. Her ekranda fiyat tazeliği kuralı: üst bar veri noktası + PriceText "eski" işareti. Borsa dışında hiçbir şey çevrimdışı engellenmez.

### 9.4 Bildirimler (yerel)
Varsayılan **kapalı**, ilk kullanımda sorulur: Vardiya doldu · Supply hazır · Sipariş geldi/bitiyor · Fiyat uyarısı. Günde en çok 3; gece 23–08 sessiz; tek dokunuşla türü kapat.

---

## 10. İçerik ve metin

### 10.1 Ton
Kuru, yardımcı, kısa; jargon ilk geçişte açıklanır. Ünlem yok (altın çıkışta tek istisna). Emir kipi yerine öneri ("Bozdurabilirsin"). Asla suçlayıcı veya "şanslıydın/şanssızdın" yargısı yok; sayılarla konuş.

### 10.2 Terimler sözlüğü (TR)
| Terim | Kullanım |
|---|---|
| Kasa | Açılan kutu (anahtar dahil fiyat) |
| Anahtar | Kasayı açan öğe (ayrı gösterilir) |
| Aşınma | Wear: Fabrikadan Yeni (FN), Az Aşınmış (MW), Saha Test (FT), Eskimiş (WW), Savaş Yarası (BS); kısaltmalar FN/MW/FT/WW/BS kalır |
| Float | Aşınma değeri (sayı) |
| Sat | Satış, %10 komisyonla |
| Bozdur | "Sat"ın günlük karşılığı (yalnız öneri metinlerinde) |
| Mühürlü | Açılmamış kasa |
| Vardiya | Çevrimdışı gelir |
| Supply | Süreli ücretsiz ödül |
| Bayi | NPC alıcı |

### 10.3 Biçim kuralları
- Para: `$1,284.50`; binden büyükte ondalık yok (`$12,400`), 1000 altı daima iki ondalık, istisna aralıkta (`$0.06 - $0.20`).
- Yüzde: `%30` (Türkçe sıra: işaret önde), ondalık gerekirse bir hane (`%12.5`).
- Tarih/saat: "2 sa 14 dk önce", "Yarın 08:00", 24 saat.
- Büyük/küçük harf: başlıklar BÜYÜK HARF (yalnız ≤3 sözcük), cümleler normal.
- Çoğul: "1 kasa / 3 kasa" (sayıdan sonra çoğul eki yok).
- Eksen/birim: float 3–4 hane (`0.0123`), desen `#661`.

### 10.4 Metin formülleri
- **Hata:** [Ne oldu] + [Ne yapabilirsin]. "Fiyatlar güncellenemedi. Eski fiyatlar kullanılıyor."
- **Onay:** [Eylem] + [Sonuç] + [Geri alınamaz mı?]. "Eşya satılsın mı? +$38.20 · Geri alabilirsin (5 sn)."
- **Boş:** [Durum] + [Sıradaki adım]. "Raflar boş. Kasalara göz at."
- **Başarı:** [Ne oldu] + [Fark]. "3 eşya satıldı +$18.40."

### 10.5 Mikro metin kütüphanesi (örnekler)
| Yer | Metin |
|---|---|
| Depo öneri (ödül) | "Alınmayı bekleyen ödülün var." |
| Depo öneri (ücretsiz) | "2 ücretsiz kasa seni bekliyor." |
| Depo öneri (sipariş) | "Selin'in siparişini karşılayabilirsin. Prim +$6.80." |
| Para az | "Kasada az para var. Rafta $14.20'lık eşya duruyor." |
| Kasa detay (yetersiz) | "Eksik $0.80." |
| Oto-çevir bilgi | "Kırmızı veya altın çıkarsa durur." |
| Oto-sat bilgi | "$0.50 altındakiler satılır. Covert ve üstü her zaman kalır." |
| RTP ipucu | "Uzun vadede açılış maliyetinin yaklaşık %44'ü geri döner." |
| Albüm tamamlanmaya yakın | "Bu koleksiyon 1 parça uzakta." |
| Float | "FN içinde %12 · düşük float." |
| Borsa kapalı | "Fiyatlar 14 saattir eski. Borsa kapalı." |
| Upgrade onay | "Bu eşya $230. Yanarsa geri gelmez." |
| Mola | "45 dakikadır buradasın. Kısa bir ara iyi gelir." |
| Boş envanter | "Raflar boş." |
| Boş sipariş | "Şu an açık sipariş yok." |
| Kilit | "Takas için 320 XP kaldı. Kasa açarak kazan." |

---

## 11. Erişilebilirlik (WCAG 2.2 AA hedefi)

### 11.1 Kontrol listesi
| Kriter | Karşılık |
|---|---|
| 1.4.3 Kontrast | Metin ≥4.5:1, büyük metin ≥3:1; amber üstü koyu metin ~11:1; `text.1` (#98A3B5) zemin `bg.1` üzerinde ≥4.8:1 doğrulanır |
| 1.4.1 Renk tek ipucu olmaz | Nadirlik sembolü, durum sözcüğü, ▲▼ işaretleri |
| 1.4.4 Yazı boyutu | %200'e kadar düzen bozulmaz (kaydırılabilir bölgeler, sabit yüksekliklerde `minHeight`) |
| 2.5.5/2.5.8 Hedef boyutu | ≥44×44 dp |
| 2.4.7 Odak görünür | Harici klavye/switch için 2dp amber odak çerçevesi |
| 2.3.3 Hareket | "Hareketi azalt": parçacık, sarsıntı ve geçiş efektleri kapanır |
| 1.3.1 Anlamsal yapı | Başlıklar `header` rolü, listeler `list`, düğmeler `button` |
| 4.1.2 Ad, rol, değer | Tüm etkileşimde `accessibilityLabel/Role/State` (şu an 0, hedef %100) |
| 3.3.1/3.3.3 Hata | Hata metni nedeni ve çözümü söyler |
| 3.2.6 Tutarlı yardım | Yardım/ipucu aynı yerde (Profil → Ayarlar → İpuçları) |

### 11.2 Ekran okuyucu metin örnekleri
- Eşya kartı: "Covert, AK-47 Kızıl Çizgi, Saha Test, float 0.2312, 38 dolar 20 sent."
- Kasa kartı: "Fever Case, 2 dolar 99 sent, geri dönüş yüzde otuz, 24 saatte yüzde iki yükseldi, ücretsiz stok yok."
- Açılış sonucu (liveRegion assertive): "Sonuç: Classified, M4A4 Neo-Noir, 12 dolar."
- Bakiye değişimi: "Bakiye 47 dolar 01 sent, 2 dolar 99 sent azaldı."

### 11.3 Diğer
- Renk körü modu: nadirlik renkleri yerine **desenli dolgu** (çizgi/nokta) seçeneği.
- Ses tek başına bilgi taşımaz.
- Yazı ölçeğiyle büyüyen yerlerde kısaltma yerine satır kaydırma.

---

## 12. Hareket spesifikasyonu

| Geçiş | Süre | Eğri | Tarif |
|---|---|---|---|
| Sekme değişimi | 160 ms | ease-out | İçerik çapraz solma, yatay kayma yok (hız) |
| Ekran ileri | 220 ms | cubic-out | Sağdan 24 dp kayma + solma |
| Sheet açılış | 240 ms | cubic-out | Alttan, zemin karartma 160 ms |
| Sheet kapanış | 180 ms | cubic-in | |
| Düğme basış | 90 ms | ease-out | Ölçek 0.97 |
| Bakiye sayma | 600 ms | ease-out | Rakam kayması (rolling) |
| Para uçuşu | 450 ms | cubic-out | Kaynak → bakiye, 6 parçacık |
| Rozet belirme | 200 ms | spring (hafif) | Ölçek 0→1.1→1 |
| Toast giriş/çıkış | 220/160 ms | | Üstten 24 dp |
| Skeleton | 1200 ms döngü | linear | Soldan sağa parlama |
| Kasa yüzme | 3600 ms döngü | ease-in-out | ±6 dp; **yalnız sahnede ve boştayken** |
Kural: aynı anda en çok **iki** hareketli öğe (açılış sahnesi hariç); kaydırma sırasında dekoratif hareket durur. "Hareketi azalt": tüm süreler ≤80 ms, parçacıklar ve sarsıntı kapalı.

---

## 13. Duyarlı düzen

| Sınıf | Genişlik | Kural |
|---|---|---|
| Küçük | ≤ 360 dp | Kasa ızgarası 3 sütun (kart 96), yazı ölçeği ≥130% ise 2 sütun |
| Standart | 361–412 | Referans düzen |
| Geniş/katlanabilir | 413–599 | Kart sayısı +1 sütun; sheet maksimum 480 genişlik |
| Tablet | ≥ 600 | **İki panel:** solda liste, sağda detay (Kasalar, Kasam); alt sekme → sol navigasyon rayı |
- Güvenli alan: üst/alt çentik ve hareket çubuğu; eylem çubuğu hareket çubuğunun üstünde.
- Klavye açılınca (arama, yedek içe aktarma) eylem çubuğu yukarı kayar, içerik kaybolmaz.
- Yönlendirme: dikey kilitli; kasa açılış sahnesi **yatay modda** daha geniş şerit sunabilir (isteğe bağlı, Faz G).

---

## 14. Ölçüm ve test

### 14.1 UX metrikleri (yerel, kimliksiz; ayarlardan kapatılabilir)
| Metrik | Hedef |
|---|---|
| Soğuk açılış → etkileşim | ≤ 2.5 sn |
| Açılıştan ilk kasa açmaya | ≤ 25 sn (yeni), ≤ 6 sn (kayıtlı) |
| Kasa açma görevi (F1) başarı | ≥ %95, ≤ 2 dokunuş |
| Satış hatası (geri al oranı) | ≤ %8 |
| Oto-çevir kullanımı | izlenir, "sınır tetiklendi" oranı |
| Boş durum görüntülenme | izlenir; eylem tıklanma ≥ %30 |
| Geri dönüş (D1/D7) | D1 ≥ %35, D7 ≥ %15 |
| SUS skoru | ≥ 80 |

### 14.2 Kullanılabilirlik testi (5–8 kişi, düşünerek sesli)
Görevler ve başarı ölçütü:
1. Uygulamayı ilk kez aç, bir kasa aç (≤45 sn, yardımsız).
2. Çıkan eşyayı sat, yanlışsa geri al (geri al'ı bulma ≥ %80).
3. Bir kasanın içeriğini ve geri dönüş oranını bul (≥ %80 anlıyor).
4. Bakiyeni bitir; para bulmanın yolunu bul (≥ %90, çıkmaz sokak yok).
5. Bir bayi siparişini teslim et (≤ 6 dokunuş).
6. Bir eşyanın float'ının iyi olup olmadığını söyle (≥ %70 doğru).
7. Oto-çevir'i güvenli ayarla (sınırları söyle).
8. Fiyat verisinin eski olduğunu fark et (≥ %80).
Çıktı: bulgu listesi (ciddiyet 1-4), düzeltme önceliği.

### 14.3 Tasarım QA kontrol listesi (her ekran için)
- [ ] Ana eylem alt bölgede ve ≥56 dp mi?
- [ ] Tüm dokunma hedefleri ≥44 dp mi?
- [ ] Boş, yükleniyor, hata, çevrimdışı durumları tanımlı mı?
- [ ] Para değişimi Geçmiş'e yazıyor ve görünüyor mu?
- [ ] Geri dönüşsüz işlem onaylı veya geri alınabilir mi?
- [ ] Renk dışında bir ipucu var mı (sembol/metin)?
- [ ] %200 yazı boyutunda bozulmadan okunuyor mu?
- [ ] Ekran okuyucu etiketleri anlamlı mı?
- [ ] "Hareketi azalt" altında çalışıyor mu?
- [ ] Metin formülü (10.4) uygulanmış mı?

---

## 15. Uygulama planı (mevcut koddan yeni UX'e)

Sıra, kullanıcıya en çok değer + en az risk sırasına göredir. Her adım ayrı bir APK.

| Adım | Kapsam | Dosyalar | Kabul |
|---|---|---|---|
| **U1 Güvenlik ve temel** | D2 sonuç garantisi, D12/D13 onaylar, D20 geri al, D17 erişilebilirlik etiketleri (ilk geçiş), toast kuyruğu | `store/game.ts`, `Cases.tsx`, `Games.tsx`, `ui.tsx` | Sonuç hiçbir koşulda kaybolmaz; Upgrade/Coinflip onaylı |
| **U2 Tasarım sistemi** | Token dosyası, çizgi ikon seti, Button/Chip/Toggle/Segmented/Sheet/PriceText/RarityBadge yeniden, font değişimi | `theme/*`, `components/*` | Tüm ekranlar yeni bileşenlerle; emoji kalmaz |
| **U3 Kasa detay** | Yapışkan eylem çubuğu, durum çipleri, alt sekmeler (İçerik/Olasılık/Geçmiş), RTP rozeti, "Eksik $X" sheet'i | `Cases.tsx`, `engine/extra.ts` | F1 ≤2 dokunuş; 6 şerit ≥50 fps |
| **U4 Sonuç ve açılış** | Yeni seçim modeli, Geri al, koreografi v3, atla | `Cases.tsx`, `components/Reel.tsx` | Test görevi 2 ≥%80 |
| **U5 Depo ana ekranı** | Öneri motoru, vardiya, hedefler, veri noktası | `screens/Depo.tsx`, `nav.ts` | Etkileşim ≤1.5 sn |
| **U6 Kasam** | "Seç" düğmesi, akıllı seçim, Float Lab, Albüm iskeleti | `Inventory.tsx` | F3 ≤3 dokunuş |
| **U7 Piyasa** | Nabız, Borsa, veri tazeliği | `screens/Piyasa.tsx`, `history.json` | F7, F12 akışları |
| **U8 Erişilebilirlik tamamı** | %200 yazı, renk körü modu, ekran okuyucu metinleri, hareketi azalt | tümü | WCAG 2.2 AA listesi geçer |
| **U9 Ölçüm ve test turu** | Yerel metrikler, kullanılabilirlik testi, bulgu düzeltme | `services/metrics.ts` | SUS ≥ 80 |

**Çalışma biçimi:** Bu belge ekran kaynağıdır; her ekran uygulanırken ilgili bölüm kontrol listesi (14.3) ile kapatılır. Görsel tasarım dosyası (Figma) yoktur; ekran görüntüsü karşılaştırma testi (Maestro) referanslarını ilk onaylı sürümden üretir.

---

## 16. Karar bekleyen UX soruları
1. **Alt sekme etiketleri:** 5 sekme adı (Depo, Kasalar, Kasam, Piyasa, Atölye) uygun mu? Alternatif: Ana, Aç, Envanter, Piyasa, Oyunlar.
2. **Geri al penceresi** 5 sn yeterli mi (satış için)?
3. **Onay eşiği $30:** başlangıç bakiyesi $50 için fazla sıkı mı? (Önerim: bakiyenin %25'i ya da $30, hangisi küçükse.)
4. **İkon seti:** hazır Lucide benzeri + 12 özel ikon, ya da tamamı özel?
5. **Tablet iki panel** ilk sürüme dahil mi, sonraya mı?

Önerilen başlangıç: **U1 (güvenlik/temel) + U2 (tasarım sistemi)**; çünkü D2, D12, D13, D17 gibi 4 ciddiyetli bulgular önce kapanmalı ve sonraki tüm ekranlar yeni bileşenler üzerine kurulmalı.
