# hesapla

## Proje Amacı
Bu proje, Enpara'dan alınan PDF hesap hareketi dökümlerini analiz edip, harcamalarınızı ve gelen paraları modern ve görsel bir web arayüzünde incelemenizi sağlar. Grafikler, ısı haritası ve filtreleme ile harcama alışkanlıklarınızı kolayca görebilirsiniz.

## Özellikler
- PDF dosyasından Enpara hesap hareketlerini otomatik ayrıştırma
- Sadece gerçek kart harcamalarını ve gelirleri analiz etme
- Günlük toplam harcama bar grafiği
- Harcama türlerine göre pasta grafiği
- En çok harcama yapılan gün ve detayları
- Günlük harcama yoğunluğu için ısı haritası (heatmap)
- Tablo üzerinde arama ve sıralama
- Tüm başlıklar ve arayüz Türkçe
- Karanlık/aydınlık tema desteği
- PDF olarak rapor indirme
- Yüklenen dosya sunucuda saklanmaz, analiz sonrası silinir

## Kurulum
1. Bu repoyu klonlayın:
   ```bash
   git clone https://github.com/erdemkosk/hesapla.git
   cd hesapla
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı başlatın:
   ```bash
   npm start
   ```
4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Kullanım
1. Enpara internet şubesinden veya mobil uygulamadan hesap hareketlerinizi PDF olarak indirin.
2. Ana sayfada PDF dosyanızı yükleyin ve "Yükle & Analiz Et" butonuna tıklayın.
3. Harcamalarınızı, grafiklerle ve ısı haritasıyla analiz edin.
4. Dilerseniz raporu PDF olarak indirebilirsiniz.

## Gizlilik
Yüklediğiniz PDF dosyası sunucuda kalıcı olarak saklanmaz, sadece analiz için geçici olarak işlenir ve işlem tamamlandıktan sonra silinir.

## Katkı
Katkıda bulunmak isterseniz lütfen bir issue açın veya pull request gönderin.

## Lisans
MIT 