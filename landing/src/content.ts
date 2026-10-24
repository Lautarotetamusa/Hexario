import type { RankingEntry } from '@ds';
import type { LngLat, LocalIj, TerritorySpec } from './hexMosaic';

export const ROSARIO_CENTER: LngLat = [-60.6393, -32.9468];

export const NAV_LINKS = [
  { href: '#como-se-juega', label: 'Cómo se juega' },
  { href: '#puntos', label: 'Puntos' },
  { href: '#comercios', label: 'Comercios' },
  { href: '#preguntas', label: 'Preguntas' },
];

export const HERO_TERRITORIES: TerritorySpec[] = [
  { owner: 'me', anchor: { i: 0, j: 0 }, radius: 1 },
  { owner: 'me', anchor: { i: 2, j: 1 }, radius: 0 },
  { owner: 'me', anchor: { i: -1, j: -2 }, radius: 0 },
  { owner: 'sky', anchor: { i: 3, j: -2 }, radius: 1 },
  { owner: 'sky', anchor: { i: 2, j: -3 }, radius: 0, stealable: true },
  { owner: 'coral', anchor: { i: -3, j: 1 }, radius: 1 },
  { owner: 'violet', anchor: { i: -1, j: 4 }, radius: 1 },
  { owner: null, anchor: { i: -4, j: -1 }, radius: 0, legendary: true },
];

export const HERO_TRAIL: LocalIj[] = [
  { i: -3, j: -3 },
  { i: -2, j: -2 },
  { i: -1, j: -2 },
  { i: -1, j: -1 },
  { i: 0, j: 0 },
  { i: 1, j: 0 },
  { i: 2, j: 1 },
];

export const HERO_CAPTURE: LocalIj = { i: 2, j: 1 };
export const HERO_FEATURED_HEX: LocalIj = { i: 2, j: -3 };

export const KEY_FIGURES = [
  { label: 'Por hexágono', value: '15.000', unit: 'm²' },
  { label: 'De protección', value: '6', unit: 'h' },
  { label: 'Para volver', value: '7', unit: 'días' },
];

export const STEPS = [
  {
    title: 'Reclamá',
    text: 'Pasá por un hexágono libre y quedate 5 segundos. Es tuyo, y nadie te lo puede sacar por 6 horas.',
    card: { state: 'free', place: 'Plaza Pringles · a 80 m', rentPerHour: 1 },
  },
  {
    title: 'Cobrá renta',
    text: 'Cada hexágono te da 1 punto por hora, solo. No hay botón de cobrar. La renta baja con los días y vuelve al máximo cada vez que pasás.',
    card: { state: 'mine', ownerName: 'Vos', place: 'Bv. Oroño · tuyo', rentPerHour: 1, protectionLeftMs: 4 * 3_600_000 + 12 * 60_000 + 9_000 },
  },
  {
    title: 'Defendelo',
    text: 'Cuando vence la protección, cualquiera que pase te lo puede robar. Y si en 7 días no volvés, se libera.',
    card: { state: 'stealable', ownerName: 'Juli', ownerColor: 'sky', place: 'Pichincha · a 320 m', rentPerHour: 1 },
  },
] as const;

export const LIFECYCLE = [
  { tone: 'neutral', label: 'Libre', text: 'Cualquiera lo puede reclamar.' },
  { tone: 'protected', label: 'Protegido · 6 h', text: 'Nadie te lo saca. Renta al máximo.' },
  { tone: 'alert', label: 'Robable', text: 'Sigue siendo tuyo, hasta que alguien pase.' },
  { tone: 'neutral', label: 'Libre a los 7 días', text: 'Si no volviste, vuelve al mapa.' },
] as const;

export const THEFT_EXAMPLE = {
  thiefName: 'Juli',
  thiefColor: 'sky',
  place: 'Pichincha',
  when: 'Hace 2 min',
  lostRentPerHour: 1,
} as const;

export const COUPON_EXAMPLE = {
  merchant: 'Café Pichincha',
  merchantPlace: 'Pichincha · a 2 cuadras',
  prize: '2x1 en cortados',
  costPoints: 400,
  code: 'HX-7KQ4-PZ',
  expiresIn: '14:52',
};

export const COUPON_FACTS = ['Cupón de un solo uso', 'Vence a los 15 minutos', 'Se canjea a menos de 300 m del local'];

export type RankingPeriod = 'week' | 'month' | 'all';

export const RANKING_PERIODS: Array<{ value: RankingPeriod; label: string }> = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Siempre' },
];

export const RANKING: Record<RankingPeriod, RankingEntry[]> = {
  week: [
    { id: 'juli', position: 1, name: 'Juli', color: 'sky', hexagons: 38, points: 812 },
    { id: 'tomi', position: 2, name: 'Tomi', color: 'coral', hexagons: 31, points: 704 },
    { id: 'agus', position: 3, name: 'Agus', color: 'violet', hexagons: 24, points: 566 },
    { id: 'me', position: 7, name: 'Vos', color: 'me', hexagons: 12, points: 291, isMe: true },
  ],
  month: [
    { id: 'tomi', position: 1, name: 'Tomi', color: 'coral', hexagons: 31, points: 2_940 },
    { id: 'juli', position: 2, name: 'Juli', color: 'sky', hexagons: 38, points: 2_815 },
    { id: 'meli', position: 3, name: 'Meli', color: 'neutral', hexagons: 19, points: 1_978 },
    { id: 'me', position: 11, name: 'Vos', color: 'me', hexagons: 12, points: 1_022, isMe: true },
  ],
  all: [
    { id: 'tomi', position: 1, name: 'Tomi', color: 'coral', hexagons: 31, points: 14_310 },
    { id: 'agus', position: 2, name: 'Agus', color: 'violet', hexagons: 24, points: 12_877 },
    { id: 'juli', position: 3, name: 'Juli', color: 'sky', hexagons: 38, points: 11_402 },
    { id: 'me', position: 26, name: 'Vos', color: 'me', hexagons: 12, points: 3_384, isMe: true },
  ],
};

export const PRINCIPLES = [
  { title: 'El mundo real manda.', text: 'Reclamar, renovar y robar exigen estar ahí. Nada se hace desde el sillón.' },
  { title: 'Sin atajos.', text: 'No hay puntos pagos ni límite de hexágonos. El límite son tus piernas.' },
  { title: 'Sin rastreo de fondo.', text: 'La ubicación se usa sólo con la app abierta y se borra a los 30 días.' },
  { title: 'Nadie ve dónde estás.', text: 'Los demás ven hexágonos de colores, nunca personas.' },
];

export const MERCHANT_FEATURES = [
  'Publicás promos y fijás el stock',
  'Validás cupones desde un panel web',
  'Durante el lanzamiento es gratis',
];

export const FAQ = [
  {
    question: '¿Tengo que descargar algo?',
    answer: 'No. Hexario es una app web: la abrís en el navegador y, si querés, la instalás en la pantalla de inicio.',
  },
  {
    question: '¿Puedo jugar en auto o en colectivo?',
    answer: 'No. Arriba de 30 km/h las acciones no cuentan. Caminando o en bici, sí.',
  },
  {
    question: '¿Cuántos hexágonos puedo tener?',
    answer: 'Todos los que puedas recorrer y defender. No hay límite.',
  },
  {
    question: '¿Qué pasa si me roban?',
    answer: 'Perdés la renta que venía, no la que ya cobraste. Apenas vence su protección, podés ir a recuperarlo.',
  },
  {
    question: '¿Los puntos vencen?',
    answer: 'No. Tampoco se compran, ni se transfieren, ni se cambian por plata: sólo se canjean por promos.',
  },
  {
    question: '¿Usa mi ubicación todo el tiempo?',
    answer: 'No. Sólo con la app abierta y sólo para validar que estás donde decís. Se guarda 30 días como máximo.',
  },
  {
    question: '¿Quién puede jugar?',
    answer: 'Cualquier persona mayor de 18 años. Arrancamos en Rosario.',
  },
];
