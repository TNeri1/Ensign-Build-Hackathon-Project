import { useEffect, useState } from 'react';
import { IconButton } from './m3/IconButton';

/** 'system' = no explicit choice: follow prefers-color-scheme. */
export type ThemeMode = 'system' | 'light' | 'dark';
type Scheme = 'light' | 'dark';

/** localStorage key; also read by the inline script in web/index.html (keep in sync). */
export const THEME_STORAGE_KEY = 'vlf-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Fallback surface colors (same as the theme-color tags in web/index.html). */
const SURFACE: Record<Scheme, string> = { light: '#faf8ff', dark: '#121318' };

export function readSavedTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function osScheme(): Scheme {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * Keeps the mobile browser bar in step with an explicit theme. index.html has two media-scoped
 * theme-color tags for 'system'; an explicit theme adds one unscoped tag BEFORE them (the first
 * matching tag wins) holding the resolved surface color, and 'system' removes it again.
 */
function syncThemeColor(mode: ThemeMode) {
  const head = document.head;
  let tag = head.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-explicit]');
  if (mode === 'system') {
    tag?.remove();
    return;
  }
  const computed = getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-surface').trim();
  const surface = computed || SURFACE[mode];
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'theme-color';
    tag.dataset.explicit = '';
    head.insertBefore(tag, head.querySelector('meta[name="theme-color"]'));
  }
  tag.content = surface;
}

/** Sets <html data-theme> (tokens.css honours it); 'system' removes it so prefers-color-scheme wins. */
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') delete root.dataset.theme;
  else root.dataset.theme = mode;
  syncThemeColor(mode);
}

function saveTheme(mode: ThemeMode) {
  try {
    if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage blocked (private mode): theme still applies for this page view */
  }
}

/** The OS color scheme, updated live when the user changes it. */
function useOsScheme(): Scheme {
  const [scheme, setScheme] = useState<Scheme>(osScheme);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => setScheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return scheme;
}

/**
 * Two-state light/dark toggle. The icon shows the theme you switch TO (dark_mode while light).
 * Picking the theme the OS already uses clears the explicit choice, so the app follows the system
 * again; picking the other one stores it.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(readSavedTheme);
  const os = useOsScheme();
  const effective: Scheme = mode === 'system' ? os : mode;
  const target: Scheme = effective === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      icon={target === 'dark' ? 'dark_mode' : 'light_mode'}
      label={`Switch to ${target} theme`}
      onClick={() => {
        const next: ThemeMode = target === os ? 'system' : target;
        applyTheme(next);
        saveTheme(next);
        setMode(next);
      }}
    />
  );
}
