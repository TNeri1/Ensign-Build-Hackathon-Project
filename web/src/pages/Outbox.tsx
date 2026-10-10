import { useEffect } from 'react';
import { useGet } from '../api/useApi';

interface Msg { id: number; channel: string; to: string; subject: string; body: string; createdAt: string }

const URL_RE = /(https?:\/\/[^\s]+)/g;
const linkify = (text: string) =>
  text.split(URL_RE).map((part, i) => (i % 2 ? <a key={i} href={part}>{part}</a> : part));

/** Dev Outbox: every "email"/"SMS" the system would have sent. Auto-refreshes. */
export function Outbox() {
  const { data, reload } = useGet<Msg[]>('/outbox');
  useEffect(() => {
    const t = setInterval(reload, 3000);
    return () => clearInterval(t);
  }, [reload]);

  return (
    <div className="stack">
      <h1>Outbox <span className="muted">(dev: no real email/SMS is sent)</span></h1>
      {data?.length === 0 && <p className="muted">Nothing sent yet.</p>}
      {data?.map((m) => (
        <article key={m.id} className="card">
          <div className="row"><strong>{m.subject}</strong><span className="badge">{m.channel}</span></div>
          <div className="muted">To {m.to} · {new Date(m.createdAt).toLocaleString()}</div>
          <pre className="msg">{linkify(m.body)}</pre>
        </article>
      ))}
    </div>
  );
}
