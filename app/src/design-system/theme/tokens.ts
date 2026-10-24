/**
 * Hexario — tokens de diseño.
 * Fuente única para TypeScript (mapa, canvas, lógica). Los mismos valores
 * viven como variables CSS en src/styles/tokens.css para la interfaz.
 */

export type ThemeName = 'light' | 'dark';

export const ui = {
  light: {
    panel: '#FFFFFF',
    ink: '#0D110D',
    ink2: '#6B706B', // texto secundario · 5.1:1 sobre panel
    inkBody: '#3E433E',
    line: '#E6E8E5',
    lineStrong: '#D5D8D4',
    surface: '#F4F5F3',
    action: '#0D110D',
    onAction: '#FFFFFF',
    actionPressed: '#2B302B',
    disabledBg: '#EDEFEC',
    disabledInk: '#6B706B',
    okBg: '#E4F7EA',
    okInk: '#14713A', // 5.4:1
    alertBg: '#FDECE9',
    alertInk: '#B93A27', // 5.7:1
    goldBg: '#FFF4D6',
    goldInk: '#8A5D10', // 5.8:1
  },
  dark: {
    panel: '#121512',
    ink: '#F2F5F1',
    ink2: '#9AA19A', // 7.0:1
    inkBody: '#C9CEC8',
    line: '#262B26',
    lineStrong: '#3A403A',
    surface: '#1B1F1B',
    action: '#F2F5F1',
    onAction: '#0D110D',
    actionPressed: '#DCE0DB',
    disabledBg: '#1F231F',
    disabledInk: '#8A918A',
    okBg: '#163222',
    okInk: '#7BE3A0', // 8.8:1
    alertBg: '#3A1A15',
    alertInk: '#FF9C8E', // 9.1:1
    goldBg: '#3A2E12',
    goldInk: '#FFD166',
  },
} as const;

export const map = {
  light: {
    ground: '#F1F2F0',
    street: '#FFFFFF',
    streetMajor: '#FFFFFF',
    water: '#DFE4E7',
    park: '#E7ECE5',
    grid: 'rgba(13,17,13,0.07)',
    label: '#6B706B',
    labelWater: '#5A5F5A',
    halo: '#F1F2F0',
  },
  dark: {
    ground: '#171A17',
    street: '#222622',
    streetMajor: '#2A2F2A',
    water: '#131B20',
    park: '#172017',
    grid: 'rgba(242,245,241,0.07)',
    label: '#9AA19A',
    labelWater: '#9AA19A',
    halo: '#171A17',
  },
} as const;

/**
 * Jugadores. Escalonados por claridad (luminancia relativa entre paréntesis)
 * para que se distingan sin percibir el tono:
 * sky (0.67) > me (0.58) > coral (0.43) > violet (0.20).
 */
export type PlayerColor = 'me' | 'sky' | 'coral' | 'violet' | 'neutral';

export const players: Record<ThemeName, Record<PlayerColor, { fill: string; line: string }>> = {
  light: {
    me: { fill: '#5EE08A', line: '#22B862' },
    sky: { fill: '#9ADFFF', line: '#2EA6E8' },
    coral: { fill: '#FF8F80', line: '#EC5A45' },
    violet: { fill: '#8A5CF6', line: '#6236D9' },
    neutral: { fill: '#B9BEB8', line: '#8E938E' },
  },
  dark: {
    me: { fill: '#5EE08A', line: '#22B862' },
    sky: { fill: '#9ADFFF', line: '#2EA6E8' },
    coral: { fill: '#FF8F80', line: '#EC5A45' },
    violet: { fill: '#8A5CF6', line: '#9B74FF' },
    neutral: { fill: '#6B706B', line: '#8A918A' },
  },
};

export const legendary = {
  fill: '#FFD166',
  line: '#E0A63A',
  star: { light: '#8A5D10', dark: '#FFD166' },
} as const;

/** Opacidad de relleno de los hexágonos. */
export const hexOpacity = {
  light: { me: 0.42, rival: 0.26, legendary: 0.34, violet: 0.26, captureStart: 0.85 },
  dark: { me: 0.42, rival: 0.26, legendary: 0.3, violet: 0.34, captureStart: 0.85 },
} as const;

export const hexStroke = { me: 1.5, rival: 1.25, legendary: 2, selected: 2.5, selectedHalo: 6 } as const;

/** Avatares: relleno pleno del color del jugador con inicial en tinta (≥4.5:1 en los cuatro). */
export const avatarInk = '#0D110D';

export const font = {
  sans: "'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

export const type = {
  numHero: { family: 'mono', size: 52, lineHeight: 52, weight: 500, tracking: '-0.04em' },
  numData: { family: 'mono', size: 22, lineHeight: 24, weight: 500, tracking: '-0.02em' },
  title: { family: 'sans', size: 22, lineHeight: 26, weight: 600, tracking: '-0.015em' },
  subtitle: { family: 'sans', size: 17, lineHeight: 22, weight: 600, tracking: '0' },
  body: { family: 'sans', size: 15, lineHeight: 22, weight: 400, tracking: '0' },
  caption: { family: 'sans', size: 13, lineHeight: 18, weight: 400, tracking: '0' },
  label: { family: 'sans', size: 11, lineHeight: 14, weight: 600, tracking: '0.12em', uppercase: true },
  labelSm: { family: 'sans', size: 10, lineHeight: 12, weight: 600, tracking: '0.14em', uppercase: true },
  button: { family: 'sans', size: 14, lineHeight: 16, weight: 600, tracking: '0.08em', uppercase: true },
} as const;

/** Grilla de 4 px. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;

export const radius = { pill: 999, sheet: 22, card: 14, sm: 10, full: '50%' } as const;

export const size = { touch: 44, buttonPrimary: 56, buttonSecondary: 48, fab: 48, chip: 28, navBar: 64, avatar: 40 } as const;

export const shadow = {
  light: {
    float: '0 1px 2px rgba(13,17,13,0.06), 0 6px 20px rgba(13,17,13,0.08)',
    sheet: '0 -2px 6px rgba(13,17,13,0.04), 0 -10px 30px rgba(13,17,13,0.08)',
    toast: '0 6px 20px rgba(13,17,13,0.16)',
  },
  dark: {
    float: '0 6px 20px rgba(0,0,0,0.5)',
    sheet: '0 -10px 30px rgba(0,0,0,0.5)',
    toast: '0 6px 20px rgba(0,0,0,0.5)',
  },
} as const;

export const motion = {
  capture: { duration: 900, easing: 'cubic-bezier(.2,.7,.2,1)' },
  pop: { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)' },
  locationPulse: { duration: 2000 },
  toast: { visible: 3000 },
} as const;

export const game = {
  protectionHours: 6,
  legendaryMultiplier: 3,
  /** Zoom de MapLibre a partir del cual se ven bordes, grilla y rayado. */
  zoomNeighborhood: 15,
  /** Zoom a partir del cual se ven cuentas regresivas sobre los protegidos. */
  zoomBlock: 17,
} as const;
