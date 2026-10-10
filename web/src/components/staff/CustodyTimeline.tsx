import { ShapeIcon } from '../m3/ExpressiveShape';
import { Icon } from '../m3/Icon';
import { StatusChip } from '../m3/StatusChip';
import { formatDateTime, relativeTime } from '../../lib/format';
import { stateStyle } from './stateStyle';
import './CustodyTimeline.css';

export interface CustodyEvent {
  id: number;
  at: string;
  actor_label: string;
  from_state: string | null;
  to_state: string;
  note: string;
}

/**
 * Vertical timeline of custody events, oldest first: from -> to state, actor, time, note. Each node is the
 * new state's expressive shape (tone by state); the current one is larger and slowly turns.
 */
export function CustodyTimeline({ events }: { events: CustodyEvent[] }) {
  if (events.length === 0) {
    return <p className="custody__empty md-typescale-body-medium">No custody events recorded.</p>;
  }
  return (
    <ol className="custody" role="list">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        const st = stateStyle(e.to_state);
        return (
          <li key={e.id} className={`custody__event${last ? ' custody__event--current' : ''}`}>
            <ShapeIcon shape={st.shape} tone={st.tone} icon={e.from_state ? st.icon : 'add'} size={last ? 48 : 40} spin={last} className="custody__node" />
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
