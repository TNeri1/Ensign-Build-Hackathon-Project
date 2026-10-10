import { useCallback, useEffect, useState } from 'react';
import { api } from './client';

/** Fetch on mount (and when `path` changes). `reload()` refetches. */
export function useGet<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);

  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api.get<T>(path).then((d) => { setData(d); setError(null); }).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [path]);

  useEffect(load, [load]);
  return { data, error, loading, reload: load };
}
