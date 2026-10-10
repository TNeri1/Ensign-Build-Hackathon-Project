import { Link } from 'react-router-dom';
import { Card } from '../components/m3/Card';
import { Icon } from '../components/m3/Icon';
import type { IconName } from '../components/m3/icons';
import { LinkButton } from '../components/m3/LinkButton';
import './Home.css';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'assignment', title: 'Report it', body: 'Tell us what you lost, roughly where and when. It takes about a minute.' },
  { icon: 'travel_explore', title: 'We match', body: 'Staff log every item they find. When one matches your report, we email you a claim link.' },
  { icon: 'verified', title: 'Verify & pick up', body: 'Answer a few questions only the owner would know, then show your pickup code and photo ID at the desk.' },
];

/** Public landing page for venue visitors. */
export function Home() {
  return (
    <div className="app-page app-page--wide home">
      <section className="home-hero" aria-labelledby="home-title">
        <Icon name="travel_explore" size={160} className="home-hero__art" />
        <div className="home-hero__text">
          <h1 id="home-title" className="home-hero__title">Lost something?</h1>
          <p className="home-hero__body">
            Search the items our staff have found, or tell us what you lost and we will let you know if it turns up.
          </p>
        </div>
        <div className="home-hero__actions">
          <LinkButton to="/search" size="large" icon="search">Search found items</LinkButton>
          <LinkButton to="/report" size="large" variant="outlined" icon="assignment" className="home-hero__secondary">Report a lost item</LinkButton>
        </div>
      </section>

      <section className="md-stack" aria-labelledby="home-how">
        <h2 id="home-how">How it works</h2>
        <ol className="home-steps" role="list">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card variant="outlined" className="home-step">
                <span className="home-step__icon" aria-hidden="true"><Icon name={s.icon} /></span>
                <div className="home-step__text">
                  <span className="home-step__num">Step {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p className="home-step__body">{s.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <p className="home-staff">
        Venue staff? <Link to="/login">Staff login</Link>
      </p>
    </div>
  );
}
