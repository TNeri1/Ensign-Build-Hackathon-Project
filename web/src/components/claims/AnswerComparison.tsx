import { Icon } from '../m3/Icon';
import { LinearProgress } from '../m3/LinearProgress';
import './AnswerComparison.css';

export interface Comparison { field: string; question: string; expected: string; given: string; autoMatch: boolean }

/** "Match" (success-container, check_circle) or "Differs" (error-container, cancel). */
export function MatchChip({ match }: { match: boolean }) {
  return (
    <span className={`answer-match answer-match--${match ? 'yes' : 'no'}`}>
      <Icon name={match ? 'check_circle' : 'cancel'} size={16} />
      {match ? 'Match' : 'Differs'}
    </span>
  );
}

function Answer({ text }: { text: string }) {
  return text ? <>{text}</> : <span className="answer-empty">No answer</span>;
}

/** "3 of 4 answers match" with a determinate progress bar. */
function Summary({ rows }: { rows: Comparison[] }) {
  const matched = rows.filter((r) => r.autoMatch).length;
  const all = matched === rows.length;
  return (
    <div className="answer-summary">
      <div className="answer-summary__text">
        <Icon name={all ? 'verified' : 'help'} size={20} className={all ? 'answer-summary__icon--ok' : 'answer-summary__icon'} />
        <span><strong>{matched} of {rows.length}</strong> answers match</span>
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
          <li key={c.field} className={`answer-card answer-card--${c.autoMatch ? 'yes' : 'no'}`}>
            <div className="answer-card__head">
              <h3 className="answer-card__question">{c.question}</h3>
              <MatchChip match={c.autoMatch} />
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
            <tr key={c.field} className={c.autoMatch ? undefined : 'answer-table__row--no'}>
              <th scope="row">{c.question}</th>
              <td><Answer text={c.given} /></td>
              <td className="answer-table__record"><Answer text={c.expected} /></td>
              <td><MatchChip match={c.autoMatch} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
