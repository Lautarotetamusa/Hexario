/**
 * Elementos DOM para maplibregl.Marker (no son componentes React, así no
 * necesitás un root de React por marcador). Estilos en components.css.
 *
 *   new maplibregl.Marker({ element: createLocationMarker() }).setLngLat(pos).addTo(map)
 */

const NS = 'http://www.w3.org/2000/svg';

function svgIcon(path: string, size = 16, strokeWidth = 1.75): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', String(strokeWidth));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', path);
  svg.appendChild(p);
  return svg;
}

const TICKET = 'M3.5 7.5h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4z M14.5 7.5v10';
const STAR = 'M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.8z';

/** Punto verde con borde blanco y halo que late. */
export function createLocationMarker(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'hx-location';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'Tu ubicación');
  const halo = document.createElement('span');
  halo.className = 'hx-location__halo';
  const dot = document.createElement('span');
  dot.className = 'hx-location__dot';
  el.append(halo, dot);
  return el;
}

type PinOptions = {
  kind: 'commerce' | 'landmark';
  name: string;
  selected?: boolean;
  onClick?: () => void;
};

/** Pin mínimo de comercio adherido o de hito. Seleccionado, se vuelve píldora con nombre. */
export function createPin({ kind, name, selected, onClick }: PinOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `hx-pin hx-pin--${kind}${selected ? ' hx-pin--selected' : ''}`;
  btn.setAttribute('aria-label', kind === 'landmark' ? `${name}, hito legendario` : name);
  const circle = document.createElement('span');
  circle.className = 'hx-pin__circle';
  const icon = svgIcon(kind === 'landmark' ? STAR : TICKET, 16, kind === 'landmark' ? 2 : 1.75);
  if (kind === 'landmark') icon.setAttribute('fill', 'currentColor');
  circle.appendChild(icon);
  if (selected) {
    const label = document.createElement('span');
    label.textContent = name;
    circle.appendChild(label);
    if (kind === 'landmark') {
      const mult = document.createElement('span');
      mult.className = 'hx-num';
      mult.style.color = 'var(--hx-gold-ink)';
      mult.textContent = 'x3';
      circle.appendChild(mult);
    }
  }
  btn.appendChild(circle);
  if (onClick) btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return btn;
}

/** Etiqueta de cuenta regresiva para el hexágono protegido seleccionado (anclá con anchor: 'bottom'). */
export function createCountdownTag(text: string): HTMLElement & { setText: (t: string) => void } {
  const div = document.createElement('div');
  div.className = 'hx-countdown-tag';
  div.textContent = text;
  return Object.assign(div, { setText: (t: string) => { div.textContent = t; } });
}
