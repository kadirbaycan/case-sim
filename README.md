# Case Sim (CS2 kasa simülatörü)

## Telefondan APK alma (GitHub)
1. github.com'da yeni **boş** repo aç (ör. `case-sim`), public olsun (fiyat dosyası raw linkten okunur).
2. Repo sayfasında **Add file → Upload files**: bu zip'in İÇİNDEKİ her şeyi (`.github` klasörü dahil) yükle, Commit et.
   - Telefonda `.github` gizli klasör görünmezse zip'i aç, klasör yöneticisinden gizli dosyaları göster.
3. **Actions** sekmesi → "Fiyatları güncelle" → **Run workflow** (gerçek fiyatlar `prices.json`'a yazılır).
4. Actions → "Build APK" → **Run workflow**. ~10-15 dk sonra çalıştırmanın altında **CaseSim-APK** çıktısı olur, indir, zip'ten APK'yı çıkar, kur.
   (Android: "bilinmeyen kaynaklardan yükleme"ye izin ver.)

Fiyatlar 3 saatte bir otomatik güncellenir; uygulama açılışta güncel `prices.json`'u çeker.

## Oyun
Kasalar (42 gerçek kasa), Valve oranları, float, StatTrak, Doppler/Case Hardened desen çarpanları, provably fair RNG,
envanter/satış, Takas Kontratı (Sv.3), Upgrader (Sv.5), tıklayıcı, seviye 1-100. Para sanaldır.
Skin verisini yenilemek: `node scripts/build-data.mjs`
