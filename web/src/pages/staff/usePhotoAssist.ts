import { useCallback, useRef, useState } from 'react';
import type { VisionStatus, VisionSuggestion } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { downscaleImage } from '../../lib/downscaleImage';

export type AssistState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; summary?: string; filled: string[] }
  | { kind: 'error'; message: string };

/**
 * Photo -> local vision model -> form suggestion. `onSuggestion` merges the result and returns what it filled.
 * A newer photo always wins: replies for an older photo are dropped.
 */
export function usePhotoAssist(onSuggestion: (s: VisionSuggestion) => string[]) {
  const status = useGet<VisionStatus>('/vision/status').data;
  const [state, setState] = useState<AssistState>({ kind: 'idle' });
  const latest = useRef(0);

  const run = useCallback(async (file: File) => {
    const id = ++latest.current;
    setState({ kind: 'reading' });
    try {
      const fd = new FormData();
      fd.append('photo', await downscaleImage(file), 'photo.jpg');
      const { suggestion } = await api.post<{ suggestion: VisionSuggestion }>('/vision/describe', fd);
      if (id !== latest.current) return;
      setState({ kind: 'done', summary: suggestion.summary, filled: onSuggestion(suggestion) });
    } catch (e) {
      if (id === latest.current) setState({ kind: 'error', message: (e as Error).message });
    }
  }, [onSuggestion]);

  const reset = useCallback(() => { latest.current++; setState({ kind: 'idle' }); }, []);

  return { available: !!status?.enabled && !!status.reachable, model: status?.model, state, run, reset };
}
