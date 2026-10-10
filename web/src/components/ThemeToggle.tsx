import { useState } from 'react';
import { IconButton } from './m3/IconButton';
import type { IconName } from './m3/icons';

export type ThemeMode = 'system' | 'light' | 'dark';

/** localStorage key; also read by the inline script in web/index.html (keep in sync). */
export const THEME_STORAGE_KEY = 'vlf-theme';
const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export function readSavedTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** Sets <html data-theme> (tokens.css honours it); 'system' removes it so prefers-color-scheme wins. */
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') delete root.dataset.theme;
  else root.dataset.theme = mode;
}

function saveTheme(mode: ThemeMode) {
  try {
    if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage blocked (private mode): theme still applies for this page view */
  }
}

const ICON: Record<ThemeMode, IconName> = { system: 'smartphone', light: 'light_mode', dark: 'dark_mode' };
const NAME: Record<ThemeMode, string> = { system: 'device theme', light: 'light theme', dark: 'dark theme' };

/** Cycles system -> light -> dark. The icon shows the current mode; the label names the next one. */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(readSavedTheme);
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  return (
    <IconButton
      icon={ICON[mode]}
      label={`Using ${NAME[mode]}. Switch to ${NAME[next]}`}
      onClick={() => {
        applyTheme(next);
        saveTheme(next);
        setMode(next);
      }}
    />
  );
}
