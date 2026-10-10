import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import './Snackbar.css';

export interface SnackbarOptions {
  actionLabel?: string;
  onAction?: () => void;
  kind?: 'info' | 'error';
}

export interface SnackbarApi {
  show(message: string, opts?: SnackbarOptions): void;
}

interface Entry extends SnackbarOptions {
  id: number;
  message: string;
}

/** Plain messages auto-dismiss. Snackbars with an action never time out (WCAG 2.2.1): they stay
 *  until the user acts, closes them, or presses Escape. */
const DURATION_MS = 4000;
const DURATION_ERROR_MS = 8000;
/** An actionable snackbar only yields (after this long) when another message is waiting behind it. */
const DURATION_ACTION_QUEUED_MS = 10000;

const SnackbarContext = createContext<SnackbarApi | null>(null);

const fallback: SnackbarApi = {
  show(message) {
    console.warn('useSnackbar() used outside <SnackbarProvider>:', message);
  },
};

/** Access the app-wide snackbar. */
export function useSnackbar(): SnackbarApi {
  return useContext(SnackbarContext) ?? fallback;
}

/**
 * Material 3 snackbar host. Shows one message at a time (queued), bottom-center, above the compact
 * navigation bar. Plain messages auto-dismiss (paused while hovered or focused); actionable ones
 * persist until acted on, closed, or Escape. Info is announced politely, errors assertively, each once.
 */
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(0);
  const current = queue[0];

  const show = useCallback((message: string, opts: SnackbarOptions = {}) => {
    nextId.current += 1;
    const entry: Entry = { ...opts, id: nextId.current, message };
    setQueue((q) => [...q, entry]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => (q[0]?.id === id ? q.slice(1) : q.filter((e) => e.id !== id)));
    setPaused(false);
  }, []);

  const hasWaiting = queue.length > 1;
  useEffect(() => {
    if (!current || paused) return;
    if (current.actionLabel && !hasWaiting) return; // persistent until acted on / closed / Escape
    const ms = current.actionLabel
      ? DURATION_ACTION_QUEUED_MS
      : current.kind === 'error'
        ? DURATION_ERROR_MS
        : DURATION_MS;
    const t = window.setTimeout(() => dismiss(current.id), ms);
    return () => window.clearTimeout(t);
  }, [current, paused, hasWaiting, dismiss]);

  // Escape dismisses the visible snackbar, unless something else (menu, modal dialog) owns it.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (document.querySelector('dialog[open]')) return;
      dismiss(current.id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current, dismiss]);

  const api = useMemo<SnackbarApi>(() => ({ show }), [show]);

  const snackbar = current && (
    <div
      key={current.id}
      className={`md-snackbar${current.kind === 'error' ? ' md-snackbar--error' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {current.kind === 'error' && <Icon name="error" size={20} className="md-snackbar__icon" />}
      <span className="md-snackbar__message">{current.message}</span>
      {current.actionLabel && (
        <button
          type="button"
          className="md-snackbar__action"
          onClick={() => {
            current.onAction?.();
            dismiss(current.id);
          }}
        >
          {current.actionLabel}
        </button>
      )}
      <IconButton icon="close" label="Dismiss" className="md-snackbar__close" onClick={() => dismiss(current.id)} />
    </div>
  );

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      {/* Two always-mounted live regions so each message is announced exactly once, with the
          right urgency. Only one snackbar is visible at a time. */}
      <div className="md-snackbar-host" aria-live="polite" aria-atomic="true">
        {current && current.kind !== 'error' && snackbar}
      </div>
      <div className="md-snackbar-host" aria-live="assertive" aria-atomic="true">
        {current && current.kind === 'error' && snackbar}
      </div>
    </SnackbarContext.Provider>
  );
}
