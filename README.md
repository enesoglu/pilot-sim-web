# Pilot Performans Platformu

**NASA SOTERIA** veri seti üzerinde çalışan, yapay zekâ destekli pilot performans değerlendirme prototipi.

---

## Gereksinimler

- **Node.js** 18+ (LTS önerilir)
- **npm** 9+

---

## Kurulum ve Çalıştırma

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Tarayıcıda şu adresi aç: [http://localhost:5173](http://localhost:5173)

### 3. Üretim build'i oluştur

```bash
npm run build
```

Çıktı: `dist/` klasörü. Herhangi bir statik dosya sunucusuyla servis edilebilir.

### 4. Build önizleme

```bash
npm run preview
```

---

## Giriş Yapma

Uygulama iki demo rol sunar — gerçek kimlik doğrulama yoktur:

| Rol | Açıklama |
|-----|----------|
| **Pilot** | Ekip 1 Sol koltuğu (Ahmet Yılmaz) olarak giriş |
| **Eğitmen** | Doç. Dr. Yılmaz Ar olarak giriş; tüm 24 pilota erişim |

---

## Veri Dosyaları

`public/mocks/` klasöründe iki kaynak dosya bulunmalıdır:

| Dosya | İçerik |
|-------|--------|
| `pilot_performans_sonuclari.xlsx` | CPI, alt skorlar, kapasite metrikleri (3 sayfa) |
| `v15_champion_dataset.csv` | Örnek uçuş epoch verisi — 99 satır × 41 sütun |

Bu dosyalar sunucu tarafında değil, tarayıcıda doğrudan `fetch()` ile okunur.

---

## Sayfalar

| Route | Erişim | Açıklama |
|-------|--------|----------|
| `/login` | Herkes | Rol seçim ekranı |
| `/dashboard` | Pilot / Eğitmen | Rol bazlı gösterge paneli |
| `/scenarios` | Pilot / Eğitmen | Senaryo kütüphanesi |
| `/scenarios/:id` | Pilot / Eğitmen | Senaryo detayı ve pilot sıralaması |
| `/flights/:flightId` | Pilot / Eğitmen | **Uçuş analizi** — Zaman Çizelgesi, Özet Metrikler, Olaylar |
| `/flights/compare` | Pilot / Eğitmen | İki uçuşu yan yana karşılaştır |
| `/pilots` | Eğitmen | Tüm pilot listesi |
| `/pilots/:pilotId` | Eğitmen | Pilot profili ve eğitmen notları |
| `/pilots/compare` | Eğitmen | 2–5 pilot karşılaştırması |
| `/upload` | Pilot / Eğitmen | Simülasyon verisi yükleme (demo akış) |

---

## Öne Çıkan Özellikler

### Senkronize Zaman Çizelgesi (`SyncedTimeline`)
- 4 Recharts satırı — ortak `syncId` ile imleç/tooltip senkronizasyonu
- Fizyolojik Kalp · Fizyolojik Göz · Bilişsel · Model Çıktıları
- Alt kısmındaki fırça (Brush) ile tüm satırlar eş zamanlı yakınlaştırılır
- "Sapma (z-skoru) / Ham Değerler" toggle'ı
- Renkli olay bandı — kırmızı = stres olayı

### Uçuş Karşılaştırma (`/flights/compare`)
- Pilot × senaryo kombinasyonları dropdown'dan seçilir
- Sağ kolonda A'ya göre delta göstergesi (▲ / ▼)
- Her kolon bağımsız zaman çizelgesine ve CPI alt skor çubuklarına sahip

### Isı Haritası (HeatmapGrid)
- Eğitmen: 24 pilot × 6 senaryo
- Pilot: kendi tek satırı (1 × 6)
- Hücreye tıkla → Uçuş analizi; satır etiketine tıkla → Pilot profili

### Eğitmen Notları
- `localStorage` tabanlı kalıcı notlar
- Not ekle / sil (onay diyaloğu ile)
- Göreli zaman damgası ("3 saat önce")

---

## Teknik Notlar

- **Yalnızca frontend** — backend, veritabanı, gerçek auth yok.
- Model çıktıları (stres / bilişsel yük olasılıkları) z-skoru özelliklerinden deterministik sigmoid ile türetilmiştir. Gerçek model çıktısı değildir.
- Tüm uçuş sayfaları aynı CSV dosyasından okunan epoch verisini görüntüler (prototip sadeleştirmesi).
- Tema tercihi (`light` / `dark`) `localStorage` üzerinde saklanır; varsayılan: koyu tema.

---

## Teknoloji Yığını

| Alan | Seçim |
|------|-------|
| Build | Vite + React 18 + TypeScript strict |
| UI | MUI v5 |
| Grafikler | Recharts |
| Routing | react-router-dom v6 |
| Veri | xlsx (SheetJS) + papaparse |
| Fontlar | Inter + JetBrains Mono |

---

## Geliştirme Fazları

- **Phase 1** — Temel yapı, navigasyon, senaryo/pilot sayfaları ✅
- **Phase 2** — Gösterge panelleri, heatmap, pilot karşılaştırma, upload ✅
- **Phase 3** — Uçuş analizi, SyncedTimeline, uçuş karşılaştırma ✅
