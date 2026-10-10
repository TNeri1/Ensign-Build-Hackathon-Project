import type { AnswerVerdict } from '@vlf/shared';
import { Icon } from '../m3/Icon';
import { LinearProgress } from '../m3/LinearProgress';
import './AnswerComparison.css';

export interface Comparison { field: string; question: string; expected: string; given: string; verdict: AnswerVerdict; autoMatch: boolean }

const CHIP: Record<AnswerVerdict, { cls: string; icon: 'check_circle' | 'help' | 'cancel'; label: string }> = {
  match: { cls: 'yes', icon: 'check_circle', label: 'Match' },
  close: { cls: 'close', icon: 'help', label: 'Close match' },
  differs: { cls: 'no', icon: 'cancel', label: 'Differs' },
};

/** "Match" (success), "Close match" (warning: partly right or worded differently, look carefully) or "Differs" (error). */
export function MatchChip({ verdict }: { verdict: AnswerVerdict }) {
  const c = CHIP[verdict];
  return (
    <span className={`answer-match answer-match--${c.cls}`}>
      <Icon name={c.icon} size={16} />
      {c.label}
    </span>
  );
}

function Answer({ text }: { text: string }) {
  return text ? <>{text}</> : <span className="answer-empty">No answer</span>;
}

/** "3 of 4 answers match · 1 close" with a determinate progress bar. */
function Summary({ rows }: { rows: Comparison[] }) {
  const matched = rows.filter((r) => r.verdict === 'match').length;
  const close = rows.filter((r) => r.verdict === 'close').length;
  const all = matched === rows.length;
  return (
    <div className="answer-summary">
      <div className="answer-summary__text">
        <Icon name={all ? 'verified' : 'help'} size={20} className={all ? 'answer-summary__icon--ok' : 'answer-summary__icon'} />
        <span><strong>{matched} of {rows.length}</strong> answers match{close > 0 && <> · {close} close</>}</span>
      </div>
      <LinearProgress value={rows.length ? matched / rows.length : 0} label={`${matched} of ${rows.length} answers match`} />
    </div>
  );
}

/**
 * Claimant answers beside the private record. Compact/medium: one card per question with two
 * labeled blocks. Expanded (>= 840px): a table. Both are rendered; CSS shows one per size class.
 */
export function AnswerComparison({ rows }: { rows: Comparison[] }) {
  if (rows.length === 0) return <p className="md-on-surface-variant">This claim has no challenge questions.</p>;
  return (
    <section className="answer-compare" aria-label="Answers compared with the private record">
      <Summary rows={rows} />
      <ol className="answer-cards" role="list">
        {rows.map((c) => (
          <li key={c.field} className={`answer-card answer-card--${CHIP[c.verdict].cls}`}>
            <div className="answer-card__head">
              <h3 className="answer-card__question">{c.question}</h3>
              <MatchChip verdict={c.verdict} />
            </div>
            <div className="answer-card__pair">
              <div className="answer-block">
                <span className="answer-block__label"><Icon name="person" size={16} />Claimant said</span>
                <span className="answer-block__value"><Answer text={c.given} /></span>
              </div>
              <div className="answer-block answer-block--record">
                <span className="answer-block__label"><Icon name="lock" size={16} />On record (private)</span>
                <span className="answer-block__value"><Answer text={c.expected} /></span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <table className="answer-table">
        <thead>
          <tr><th scope="col">Question</th><th scope="col">Claimant said</th><th scope="col">On record (private)</th><th scope="col">Result</th></tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.field} className={c.verdict === 'match' ? undefined : `answer-table__row--${CHIP[c.verdict].cls}`}>
              <th scope="row">{c.question}</th>
              <td><Answer text={c.given} /></td>
              <td className="answer-table__record"><Answer text={c.expected} /></td>
              <td><MatchChip verdict={c.verdict} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
