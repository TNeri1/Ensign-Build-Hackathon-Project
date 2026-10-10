import { Card } from '../../components/m3/Card';
import { Icon } from '../../components/m3/Icon';
import type { IconName } from '../../components/m3/icons';
import { QrCode } from '../../components/QrCode';

/** Status card for a claim that is waiting (pending) or finished (done). */
export function ClaimNotice({ tone, icon, title, children }: { tone: 'pending' | 'done'; icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined" className={`claim-notice claim-notice--${tone}`} as="section" role="status">
      <span className="claim-notice__icon" aria-hidden="true"><Icon name={icon} size={28} /></span>
      <div className="claim-notice__text">
        <h2 className="claim-notice__title">{title}</h2>
        <p className="claim-notice__body">{children}</p>
      </div>
    </Card>
  );
}

const STEPS = [
  'Bring a photo ID that matches your name.',
  'Go to the lost & found desk.',
  'Show this code to staff. It works once.',
];

/** Approved claim: pickup QR code and instructions. */
export function ClaimApproved({ value }: { value: string }) {
  return (
    <Card variant="elevated" className="claim-approved" as="section" aria-labelledby="claim-approved-title">
      <div className="claim-approved__head">
        <span className="claim-approved__icon" aria-hidden="true"><Icon name="check_circle" size={28} /></span>
        <div>
          <h2 id="claim-approved-title" className="claim-notice__title">Approved! Your pickup code</h2>
          <p className="claim-notice__body">Keep this page open, or take a screenshot.</p>
        </div>
      </div>
      <div className="claim-approved__body">
        <div className="claim-approved__qr"><QrCode value={value} /></div>
        <ol className="claim-approved__steps">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </div>
    </Card>
  );
}
