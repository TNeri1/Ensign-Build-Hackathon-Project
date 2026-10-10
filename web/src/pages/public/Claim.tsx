import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { PICKUP_PREFIX } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { QrCode } from '../../components/QrCode';

interface ClaimView {
  status: 'open' | 'submitted' | 'approved' | 'denied' | 'released';
  decisionReason: string | null;
  item: { categoryLabel: string; color: string; area: string };
  questions: { field: string; question: string }[];
}

export function Claim() {
  const { token } = useParams();
  const { data, error, reload } = useGet<ClaimView>(`/public/claims/${token}`);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await api.post(`/public/claims/${token}/answers`, { answers }); setErr(''); reload(); } catch (x) { setErr((x as Error).message); }
  }

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  const { item } = data;

  return (
    <div className="stack">
      <h1>Claim your item</h1>
      <p>{item.categoryLabel} · {item.color} · found near {item.area}</p>
      {data.status === 'open' && (
        <form onSubmit={submit} className="stack">
          <p>Answer these questions about your item so we can confirm it is yours.</p>
          {data.questions.map((q) => (
            <label key={q.field} className="field">
              <span>{q.question}</span>
              <input value={answers[q.field] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.field]: e.target.value }))} required />
            </label>
          ))}
          {err && <p className="error">{err}</p>}
          <button className="primary big">Submit answers</button>
        </form>
      )}
      {data.status === 'submitted' && <p className="ok">Thanks. Staff are reviewing your answers. Check back on this page or watch your email.</p>}
      {data.status === 'denied' && <p className="error">We could not verify this claim: {data.decisionReason}</p>}
      {data.status === 'approved' && (
        <div className="stack">
          <p className="ok">Approved! Bring photo ID and show this code at the lost &amp; found desk. It works once.</p>
          <QrCode value={`${PICKUP_PREFIX}${token}`} />
        </div>
      )}
      {data.status === 'released' && <p className="ok">This item has been collected.</p>}
    </div>
  );
}
