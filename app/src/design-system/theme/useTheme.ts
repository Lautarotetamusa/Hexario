import { useCallback, useEffect, useState } from 'react';
import type { ThemeName } from './tokens';

export type ThemePreference = ThemeName | 'system';

const KEY = 'hx-theme';

function systemTheme(): ThemeName {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readPref(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Tema activo. Escribe data-theme en <html> (lo leen las variables CSS) y
 * devuelve el tema resuelto para el mapa y el canvas.
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePreference>(readPref);
  const [resolved, setResolved] = useState<ThemeName>(() => (pref === 'system' ? systemTheme() : pref));

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      const t = pref === 'system' ? systemTheme() : pref;
      setResolved(t);
      if (pref === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', pref);
      // Color de la barra del navegador / PWA
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute('content', t === 'dark' ? '#121512' : '#FFFFFF');
    };
    apply();
    mq?.addEventListener('change', apply);
    return () => mq?.removeEventListener('change', apply);
  }, [pref]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    try {
      if (p === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, p);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  return { theme: resolved, preference: pref, setPreference };
}
