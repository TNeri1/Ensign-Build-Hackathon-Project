import { ShapeIcon, shapePath, type ShapeName, type ShapeTone } from '../../components/m3/ExpressiveShape';
import type { IconName } from '../../components/m3/icons';
import { QrCode } from '../../components/QrCode';

type NoticeTone = 'pending' | 'done' | 'denied';
const NOTICE: Record<NoticeTone, [ShapeName, ShapeTone]> = {
  pending: ['flower', 'warning'],
  done: ['cookie', 'success'],
  denied: ['clover', 'error'],
};

/** Status card for a claim that is waiting (pending), finished (done) or turned down (denied). */
export function ClaimNotice({ tone, icon, title, children }: { tone: NoticeTone; icon: IconName; title: string; children: React.ReactNode }) {
  const [shape, shapeTone] = NOTICE[tone];
  return (
    <section className={`claim-notice claim-notice--${tone} md-rise`} role={tone === 'denied' ? 'alert' : 'status'}>
      <ShapeIcon shape={shape} tone={shapeTone} icon={icon} size={64} spin={tone === 'pending'} />
      <div className="claim-notice__text">
        <h2 className="claim-notice__title">{title}</h2>
        <p className="claim-notice__body">{children}</p>
      </div>
    </section>
  );
}

const STEPS = [
  'Bring a photo ID that matches your name.',
  'Go to the lost & found desk.',
  'Show this code to staff. It works once.',
];

/** Approved claim: celebratory card with the pickup QR code and instructions. */
export function ClaimApproved({ value }: { value: string }) {
  return (
    <section className="claim-approved md-rise" aria-labelledby="claim-approved-title">
      <svg className="claim-approved__decor claim-approved__decor--a" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={shapePath('sunny')} /></svg>
      <svg className="claim-approved__decor claim-approved__decor--b" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={shapePath('flower')} /></svg>
      <div className="claim-approved__head">
        <ShapeIcon shape="sunny" tone="success" icon="check_circle" size={72} spin className="claim-approved__badge" />
        <div>
          <h2 id="claim-approved-title" className="claim-approved__title">Approved! Your pickup code</h2>
          <p className="claim-approved__sub">Keep this page open, or take a screenshot.</p>
        </div>
      </div>
      <div className="claim-approved__body">
        <div className="claim-approved__qr"><QrCode value={value} /></div>
        <ol className="claim-approved__steps" role="list">
          {STEPS.map((s, i) => (
            <li key={s}>
              <span className="claim-approved__num" aria-hidden="true">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
