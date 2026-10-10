import { Icon } from '../m3/Icon';
import { StatusChip } from '../m3/StatusChip';
import { formatDateTime, relativeTime } from '../../lib/format';
import './CustodyTimeline.css';

export interface CustodyEvent {
  id: number;
  at: string;
  actor_label: string;
  from_state: string | null;
  to_state: string;
  note: string;
}

/** Vertical timeline of custody events, oldest first: from -> to state, actor, time, note. */
export function CustodyTimeline({ events }: { events: CustodyEvent[] }) {
  if (events.length === 0) {
    return <p className="custody__empty md-typescale-body-medium">No custody events recorded.</p>;
  }
  return (
    <ol className="custody" role="list">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={e.id} className={`custody__event${last ? ' custody__event--current' : ''}`}>
            <span className="custody__node" aria-hidden="true">
              <Icon name={e.from_state ? 'history' : 'add'} size={16} />
            </span>
            <div className="custody__body">
              <div className="custody__states">
                {e.from_state ? <StatusChip state={e.from_state} /> : <span className="custody__new">New</span>}
                <Icon name="chevron_right" size={18} className="custody__arrow" title="to" />
                <StatusChip state={e.to_state} />
              </div>
              <div className="custody__meta">
                <span className="custody__actor">
                  <Icon name="person" size={16} /> {e.actor_label}
                </span>
                <time dateTime={e.at} title={new Date(e.at).toLocaleString()}>
                  {formatDateTime(e.at)} · {relativeTime(e.at)}
                </time>
              </div>
              {e.note && <p className="custody__note">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
