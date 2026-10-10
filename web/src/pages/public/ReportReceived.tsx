import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Icon } from '../../components/m3/Icon';
import { LinkButton } from '../../components/m3/LinkButton';

/** Friendly confirmation shown after a lost report is filed. */
export function ReportReceived({ email, onAgain }: { email: string; onAgain: () => void }) {
  return (
    <div className="app-page report">
      <Card variant="filled" className="report-done" as="section" aria-labelledby="report-done-title">
        <span className="report-done__icon" aria-hidden="true"><Icon name="check_circle" size={40} /></span>
        <h1 id="report-done-title" className="report-done__title">Report received</h1>
        <p className="report-done__body">
          If an item matching your description is found, we will email you a link to verify and claim it
          {email ? <> at <strong>{email}</strong></> : null}.
        </p>
        <div className="report-done__actions">
          <Button variant="filled" icon="add" onClick={onAgain}>File another report</Button>
          <LinkButton to="/search" variant="text" icon="search">Browse found items</LinkButton>
        </div>
      </Card>
    </div>
  );
}
