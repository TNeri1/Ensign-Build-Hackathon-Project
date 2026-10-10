import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { PICKUP_PREFIX } from '@vlf/shared';
import { api } from '../../api/client';
import { useGet } from '../../api/useApi';
import { Alert } from '../../components/m3/Alert';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { LinearProgress } from '../../components/m3/LinearProgress';
import { PageHeader } from '../../components/m3/PageHeader';
import { StatusChip } from '../../components/m3/StatusChip';
import { TextField } from '../../components/m3/TextField';
import { CategoryAvatar, ColorTag, MetaLine, categoryIdFromLabel } from '../../components/public/ItemMeta';
import { ClaimApproved, ClaimNotice } from './ClaimStatus';
import './Claim.css';

interface ClaimView {
  status: 'open' | 'submitted' | 'approved' | 'denied' | 'released';
  decisionReason: string | null;
  item: { categoryLabel: string; color: string; area: string };
  questions: { field: string; question: string }[];
}

const SUBTITLE: Record<ClaimView['status'], string> = {
  open: 'Answer a few questions so we can confirm the item is yours.',
  submitted: 'Your answers are with our staff.',
  approved: 'Your claim is approved. Collect your item at the lost & found desk.',
  denied: 'We could not verify this claim.',
  released: 'This claim is complete.',
};

export function Claim() {
  const { token } = useParams();
  const { data, error, reload } = useGet<ClaimView>(`/public/claims/${token}`);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await api.post(`/public/claims/${token}/answers`, { answers }); setErr(''); reload(); } catch (x) { setErr((x as Error).message); }
  }

  if (error) {
    return (
      <div className="app-page claim">
        <PageHeader title="Claim your item" subtitle="We could not open this claim link." />
        <Alert kind="error">{error}</Alert>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="app-page claim">
        <PageHeader title="Claim your item" subtitle="Loading your claim…" />
        <LinearProgress label="Loading claim" />
      </div>
    );
  }
  const { item } = data;

  return (
    <div className="app-page claim">
      <PageHeader title="Claim your item" subtitle={SUBTITLE[data.status]} />

      <Card variant="filled" className="claim-item" as="section" aria-label="Item">
        <CategoryAvatar category={categoryIdFromLabel(item.categoryLabel)} large />
        <div className="claim-item__text">
          <h2 className="claim-item__title">{item.categoryLabel}</h2>
          <div className="claim-item__meta">
            <ColorTag color={item.color} />
            <MetaLine icon="location_on">Found near {item.area}</MetaLine>
          </div>
        </div>
        <div className="claim-item__status"><StatusChip state={data.status} /></div>
      </Card>

      {data.status === 'open' && (
        <form onSubmit={submit} className="claim-form">
          <p className="claim-form__intro">Only the owner should know these details. Answer as best you can; staff review every answer.</p>
          <ol className="claim-questions" role="list">
            {data.questions.map((q, i) => (
              <li key={q.field} className="claim-question">
                <label htmlFor={`claim-q-${q.field}`} className="claim-question__text">
                  <span className="claim-question__num" aria-hidden="true">{i + 1}</span>
                  {q.question}
                </label>
                <TextField id={`claim-q-${q.field}`} label="Your answer" required value={answers[q.field] ?? ''}
                  onChange={(v) => setAnswers((a) => ({ ...a, [q.field]: v }))} />
              </li>
            ))}
          </ol>
          {err && <Alert kind="error">{err}</Alert>}
          <Button type="submit" size="large" full icon="send" className="claim-submit">Submit answers</Button>
        </form>
      )}
      {data.status === 'submitted' && (
        <ClaimNotice tone="pending" icon="hourglass_empty" title="Staff are reviewing your answers">
          Thanks! Staff will compare them with the item. Check back on this page or watch your email for the result.
        </ClaimNotice>
      )}
      {data.status === 'denied' && (
        <Alert kind="error" title="We could not verify this claim">
          {data.decisionReason || 'Your answers did not match the item closely enough.'} If you think this is a mistake, visit the lost &amp; found desk.
        </Alert>
      )}
      {data.status === 'approved' && <ClaimApproved value={`${PICKUP_PREFIX}${token}`} />}
      {data.status === 'released' && (
        <ClaimNotice tone="done" icon="task_alt" title="Item collected">
          This item has been collected. Thanks for using venue lost &amp; found.
        </ClaimNotice>
      )}
    </div>
  );
}
