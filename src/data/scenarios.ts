import type { Scenario } from './types';

export const SCENARIO_CATEGORIES = {
  energy_management: 'Enerji Yönetimi',
  weather: 'Hava Durumu',
  automation: 'Otomasyon',
  turbulence: 'Türbülans',
  workload: 'İş Yükü',
  baseline: 'Temel',
  cancelled: 'İptal',
} as const;

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    code: 'CHSLY FOUR',
    titleTr: 'Trafik Sıkıştırma ve Enerji Yönetimi',
    category: 'energy_management',
    difficulty: 4,
    descTr:
      'Trafik birleşmesi sırasında ATC tarafından verilen ani hız ve profil değişiklikleri. 737-800 için yüksek enerji yönetimi gerektirir.',
    goalTr:
      'Proaktif enerji yönetimi kapasitesinin ve son dakika pist değişikliklerine uyumun ölçülmesi.',
    active: true,
  },
  {
    id: 2,
    code: 'FILPZ THREE',
    titleTr: 'Konvektif Hava Durumu',
    category: 'weather',
    difficulty: 5,
    descTr: 'Rota üzerinde aniden beliren fırtına hücreleri, türbülans ve rüzgar kırılması raporları.',
    goalTr: 'Hava durumundan kaçınma ve yaklaşma brifinginin analizi.',
    active: true,
  },
  {
    id: 3,
    code: 'BANKR TWO',
    titleTr: 'Beklenmedik Kuyruk Rüzgarları ve Otomatik Uçuş Sorunları',
    category: 'automation',
    difficulty: 4,
    descTr:
      'FMC tahminlerinden sapan rüzgarlar ve DEBBT noktasında otopilotun programlanan dönüşü başlatamaması.',
    goalTr:
      'Otomatik uçuş arızalarında pilotun durumsal farkındalığı ve manuel müdahale hızının tespiti.',
    active: true,
  },
  {
    id: 4,
    code: 'JONZE TWO',
    titleTr: 'İptal Edildi',
    category: 'cancelled',
    difficulty: 0,
    descTr: 'Bu senaryo zaman kısıtları nedeniyle deneyime dahil edilmemiştir.',
    goalTr: '—',
    active: false,
  },
  {
    id: 5,
    code: 'MLLET TWO',
    titleTr: 'Kuyruk Türbülansı ve İletişim Hataları',
    category: 'turbulence',
    difficulty: 4,
    descTr:
      'Ağır uçakların arkasında oluşan türbülans (roll upset) ve kasti ATC irtifa kısıtlaması okuma hataları.',
    goalTr: 'Kuyruk türbülansının önceden kestirilmesi ve hatalı ATC talimatlarının tespiti.',
    active: true,
  },
  {
    id: 6,
    code: 'STOCR THREE',
    titleTr: 'Yüksek İş Yükü ve Havalimanı Akış Değişimi',
    category: 'workload',
    difficulty: 5,
    descTr:
      'Karmaşık FMS girişleri ve rüzgar değişimi nedeniyle operasyon yönünün aniden değişmesi.',
    goalTr:
      'Yoğun iş yükü altında klerans uyumunun sürdürülmesi ve zaman yönetimi becerisi.',
    active: true,
  },
  {
    id: 7,
    code: 'PARQR THREE',
    titleTr: 'Alıştırma (Baseline)',
    category: 'baseline',
    difficulty: 1,
    descTr:
      'Pilotların simülatör kontrollerine ve araştırma ortamına alışması için kurgulanan nominal uçuş senaryosu.',
    goalTr: 'Performans değerlendirmesi için referans (temel) veri setinin oluşturulması.',
    active: true,
  },
];
