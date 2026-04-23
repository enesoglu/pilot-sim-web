// Deterministic Turkish names for 24 (crew, seat) pairs.
// Crews 1–11 and 13 (no crew 12), each with left and right seats.

const CREW_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];

const NAMES: Record<string, string> = {
  '1-left':  'Ahmet Yılmaz',
  '1-right': 'Mehmet Kaya',
  '2-left':  'Ali Demir',
  '2-right': 'Hasan Çelik',
  '3-left':  'Mustafa Şahin',
  '3-right': 'İbrahim Arslan',
  '4-left':  'Emre Doğan',
  '4-right': 'Burak Aydın',
  '5-left':  'Serkan Polat',
  '5-right': 'Murat Güneş',
  '6-left':  'Hüseyin Kurt',
  '6-right': 'Oğuzhan Erdoğan',
  '7-left':  'Kadir Özdemir',
  '7-right': 'Fatih Aksoy',
  '8-left':  'Uğur Kılıç',
  '8-right': 'Volkan Yıldız',
  '9-left':  'Cem Avcı',
  '9-right': 'Tarık Bozkurt',
  '10-left': 'Suat Öztürk',
  '10-right':'Levent Çetin',
  '11-left': 'Onur Güler',
  '11-right':'Bülent Koç',
  '13-left': 'Gökhan Tekin',
  '13-right':'Ercan Demirci',
};

export const PILOT_NAMES = NAMES;

export const ALL_CREW_IDS = CREW_IDS;

export function pilotIdOf(crew: number, seat: 'left' | 'right'): string {
  return `${crew}-${seat}`;
}

export function pilotDisplayName(crew: number, seat: 'left' | 'right'): string {
  const role = seat === 'left' ? 'Kaptan' : 'Yardımcı Pilot';
  const name = NAMES[`${crew}-${seat}`] ?? `Pilot ${crew}${seat === 'left' ? 'L' : 'R'}`;
  return `${name} (Ekip ${crew} • ${role})`;
}

export function pilotShortName(crew: number, seat: 'left' | 'right'): string {
  return NAMES[`${crew}-${seat}`] ?? `Pilot ${crew}${seat === 'left' ? 'L' : 'R'}`;
}

export const INSTRUCTOR_USER = {
  id: 'instructor',
  name: 'Doç. Dr. Yılmaz Ar',
  role: 'instructor' as const,
};
