import { Button } from '../../components/m3/Button';
import { ShapeIcon, shapePath, type ShapeName } from '../../components/m3/ExpressiveShape';
import { LinkButton } from '../../components/m3/LinkButton';

/** Little shapes scattered around the success badge (decorative). */
const CONFETTI: ShapeName[] = ['clover', 'cookie', 'flower', 'puffy', 'sunny', 'circle'];

const NEXT = [
  { icon: 'inventory', text: 'Staff log every item they find.' },
  { icon: 'mail', text: 'If one matches, we email you a claim link.' },
  { icon: 'verified', text: 'Answer a few questions and pick it up.' },
] as const;

/** Friendly confirmation shown after a lost report is filed. */
export function ReportReceived({ email, onAgain }: { email: string; onAgain: () => void }) {
  return (
    <div className="app-page report">
      <section className="report-done md-rise" aria-labelledby="report-done-title">
        <div className="report-done__art" aria-hidden="true">
          {CONFETTI.map((s, i) => (
            <svg key={s} className={`report-done__confetti report-done__confetti--${i}`} viewBox="0 0 100 100" focusable="false"><path d={shapePath(s)} /></svg>
          ))}
          <ShapeIcon shape="sunny" tone="success" icon="check_circle" size={128} spin className="report-done__badge" />
        </div>
        <h1 id="report-done-title" className="report-done__title">Report received</h1>
        <p className="report-done__body">
          If an item matching your description is found, we will email you a link to verify and claim it
          {email ? <> at <strong>{email}</strong></> : null}.
        </p>
        <ol className="report-done__next" role="list" aria-label="What happens next">
          {NEXT.map((n, i) => (
            <li key={n.text}>
              <ShapeIcon shape={(['cookie', 'clover', 'sunny'] as const)[i]} tone={(['primary', 'tertiary', 'success'] as const)[i]} icon={n.icon} size={40} />
              <span>{n.text}</span>
            </li>
          ))}
        </ol>
        <div className="report-done__actions">
          <Button variant="filled" size="large" icon="add" onClick={onAgain}>File another report</Button>
          <LinkButton to="/search" variant="text" size="large" icon="search">Browse found items</LinkButton>
        </div>
      </section>
    </div>
  );
}
