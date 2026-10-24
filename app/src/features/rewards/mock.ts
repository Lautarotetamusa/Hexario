/**
 * Promociones y cupón de muestra. Cuando la API de canjes exista, este archivo
 * desaparece y la pantalla consume los datos reales.
 */

export type Promotion = {
  id: string;
  merchant: string;
  /** "Centro · a 2 cuadras" */
  merchantPlace: string;
  prize: string;
  costPoints: number;
  /** Código que va dentro del QR del cupón. */
  code: string;
  /** Vigencia mostrada en el cupón, ya formateada. */
  expiresIn: string;
};

export const MOCK_REWARDS_SUMMARY = {
  points: 1284,
  available: 3,
} as const;

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'cafe-la-florida',
    merchant: 'Café La Florida',
    merchantPlace: 'Centro · a 2 cuadras',
    prize: 'Café con dos medialunas',
    costPoints: 450,
    code: 'HX-CAFE-4821',
    expiresIn: '14:52',
  },
  {
    id: 'il-padrino',
    merchant: 'Heladería Il Padrino',
    merchantPlace: 'Pichincha · a 4 cuadras',
    prize: 'Cuarto kilo a elección',
    costPoints: 900,
    code: 'HX-HELA-1907',
    expiresIn: '12:10',
  },
  {
    id: 'libreria-buchin',
    merchant: 'Librería Buchín',
    merchantPlace: 'Centro · a 6 cuadras',
    prize: '10% en tu próxima compra',
    costPoints: 350,
    code: 'HX-LIBR-3310',
    expiresIn: '09:35',
  },
  {
    id: 'bircher',
    merchant: 'Cervecería Bircher',
    merchantPlace: 'Abasto · a 9 cuadras',
    prize: 'Pinta artesanal',
    costPoints: 2400,
    code: 'HX-CERV-7742',
    expiresIn: '11:20',
  },
];

export function findPromotion(id: string): Promotion | undefined {
  return MOCK_PROMOTIONS.find((promotion) => promotion.id === id);
}
