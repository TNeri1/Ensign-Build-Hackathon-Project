import { useMemo } from 'react';
import { useGet } from '../../api/useApi';
import type { CategoryInfo } from '../../api/types';

const humanize = (s: string) => (s ? (s[0].toUpperCase() + s.slice(1)).replace(/_/g, ' ') : s);

/** Category definitions with label lookups (falls back to a humanized id while loading). */
export function useCategories() {
  const { data } = useGet<CategoryInfo[]>('/categories');
  return useMemo(() => {
    const byId = new Map((data ?? []).map((c) => [c.id, c]));
    return {
      categories: data ?? [],
      label: (id: string) => byId.get(id)?.label ?? humanize(id),
      fieldLabel: (categoryId: string, key: string) =>
        byId.get(categoryId)?.fields.find((f) => f.name === key)?.label ?? humanize(key),
    };
  }, [data]);
}
