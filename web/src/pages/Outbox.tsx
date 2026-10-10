import { useEffect } from 'react';
import { useGet } from '../api/useApi';
import { Alert } from '../components/m3/Alert';
import { Card } from '../components/m3/Card';
import { EmptyState } from '../components/m3/EmptyState';
import { ShapeIcon } from '../components/m3/ExpressiveShape';
import { LinearProgress } from '../components/m3/LinearProgress';
import { HeroHeader } from '../components/m3/HeroHeader';
import { formatDateTime, relativeTime } from '../lib/format';
import './Outbox.css';

interface Msg { id: number; channel: string; to: string; subject: string; body: string; createdAt: string }

const URL_RE = /(https?:\/\/[^\s]+)/g;
const linkify = (text: string) =>
  text.split(URL_RE).map((part, i) => (i % 2 ? <a key={i} href={part}>{part}</a> : part));

/** Dev Outbox: every "email"/"SMS" the system would have sent. Auto-refreshes. */
export function Outbox() {
  const { data, error, reload } = useGet<Msg[]>('/outbox');
  useEffect(() => {
    const t = setInterval(reload, 3000);
    return () => clearInterval(t);
  }, [reload]);

  return (
    <div className="app-page outbox">
      <HeroHeader
        title="Outbox"
        icon="outbox"
        shape="flower"
        subtitle="Dev only: messages the system would have sent. No real email or SMS leaves this machine. Refreshes every 3 seconds."
      />
      {error && <Alert kind="error">{error}</Alert>}
      {!data && !error && <LinearProgress label="Loading messages" />}
      {data?.length === 0 && (
        <EmptyState icon="outbox" title="Nothing sent yet" body="Claim links, approvals and pickup notices appear here as soon as they are sent." />
      )}
      {data && data.length > 0 && (
        <ul className="outbox-list" role="list">
          {data.map((m, i) => (
            <li key={m.id}>
              <Card variant="filled" as="article" className={i === 0 ? 'outbox-msg outbox-msg--latest md-rise' : 'outbox-msg'}>
                <div className="outbox-msg__head">
                  <ShapeIcon shape={m.channel === 'sms' ? 'clover' : 'cookie'} tone={i === 0 ? 'primary' : 'surface'}
                    icon={m.channel === 'sms' ? 'smartphone' : 'mail'} size={48} className="outbox-msg__avatar" />
                  <div className="outbox-msg__titles">
                    <h2 className="outbox-msg__subject">{m.subject}</h2>
                    <p className="outbox-msg__meta">
                      To {m.to} · <time dateTime={m.createdAt} title={formatDateTime(m.createdAt)}>{relativeTime(m.createdAt)}</time>
                    </p>
                  </div>
                  <span className="outbox-msg__channel">
                    {i === 0 && <span className="outbox-msg__new">Latest</span>}
                    <span className="outbox-msg__tag">{m.channel}</span>
                  </span>
                </div>
                <pre className="outbox-msg__body">{linkify(m.body)}</pre>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
