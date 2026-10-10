import { Link } from 'react-router-dom';
import { useGet } from '../api/useApi';
import { ShapeIcon, shapePath, type ShapeName, type ShapeTone } from '../components/m3/ExpressiveShape';
import { Icon } from '../components/m3/Icon';
import type { IconName } from '../components/m3/icons';
import { LinkButton } from '../components/m3/LinkButton';
import { categoryIcon } from '../lib/categoryIcon';
import { categoryShape, categoryTone } from '../lib/categoryStyle';
import './Home.css';

const STEPS: { icon: IconName; shape: ShapeName; tone: ShapeTone; title: string; body: string }[] = [
  { icon: 'assignment', shape: 'cookie', tone: 'primary', title: 'Report it', body: 'Tell us what you lost, roughly where and when. It takes about a minute.' },
  { icon: 'travel_explore', shape: 'clover', tone: 'tertiary', title: 'We match', body: 'Staff log every item they find. When one matches your report, we email you a claim link.' },
  { icon: 'verified', shape: 'sunny', tone: 'success', title: 'Verify & pick up', body: 'Answer a few questions only the owner would know, then show your pickup code and photo ID at the desk.' },
];

/** Lost things orbiting the big search shape in the hero art. */
const ORBIT = ['phone', 'wallet', 'keys', 'headphones'];

/** Decorative hero illustration built from expressive shapes. */
function HeroArt() {
  return (
    <div className="home-art" aria-hidden="true">
      <svg className="home-art__blob home-art__blob--clover" viewBox="0 0 100 100" focusable="false"><path d={shapePath('clover')} /></svg>
      <svg className="home-art__blob home-art__blob--puffy" viewBox="0 0 100 100" focusable="false"><path d={shapePath('puffy')} /></svg>
      <span className="home-art__dot home-art__dot--a" />
      <span className="home-art__dot home-art__dot--b" />
      <span className="home-art__dot home-art__dot--c" />
      <div className="home-art__core">
        <svg className="home-art__sun" viewBox="0 0 100 100" focusable="false"><path d={shapePath('sunny')} /></svg>
        <Icon name="travel_explore" size={96} className="home-art__glyph" />
      </div>
      {ORBIT.map((c, i) => (
        <span key={c} className={`home-art__orbit home-art__orbit--${i}`}>
          <ShapeIcon shape={categoryShape(c)} tone={categoryTone(c)} icon={categoryIcon(c)} size={56} />
        </span>
      ))}
    </div>
  );
}

/** Public landing page for venue visitors. */
export function Home() {
  const held = useGet<unknown[]>('/public/items').data?.length ?? 0;

  return (
    <div className="app-page app-page--wide home">
      <section className="home-hero md-rise" aria-labelledby="home-title">
        <svg className="home-hero__decor" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={shapePath('flower')} /></svg>
        <HeroArt />
        <div className="home-hero__text">
          <h1 id="home-title" className="home-hero__title">
            Lost something?
            <span className="home-hero__accent">Let&rsquo;s get it back.</span>
          </h1>
          <p className="home-hero__body">
            Our staff log everything they find at the venue. Search the found items now, or tell us what you lost and we
            will email you the moment it turns up.
          </p>
          <div className="home-hero__actions">
            <LinkButton to="/search" size="large" icon="search">Search found items</LinkButton>
            <LinkButton to="/report" size="large" variant="elevated" icon="assignment" className="home-hero__secondary">Report a lost item</LinkButton>
          </div>
          <p className="home-hero__stat" aria-live="polite">
            {held > 0 && (
              <>
                <span className="home-hero__pulse" aria-hidden="true" />
                <strong>{held}</strong>&nbsp;{held === 1 ? 'item is' : 'items are'} waiting for their owners right now
              </>
            )}
          </p>
        </div>
      </section>

      <section className="home-how" aria-labelledby="home-how">
        <div className="home-how__head">
          <h2 id="home-how" className="home-how__title">How it works</h2>
          <p className="home-how__sub">Three steps. No account needed.</p>
        </div>
        <ol className="home-steps" role="list">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`home-step home-step--${s.tone} md-rise`} style={{ animationDelay: `${120 + i * 80}ms` }}>
              <span className="home-step__num" aria-hidden="true">{i + 1}</span>
              <ShapeIcon shape={s.shape} tone={s.tone} icon={s.icon} size={72} className="home-step__icon" />
              <div className="home-step__text">
                <span className="home-step__label">Step {i + 1}</span>
                <h3 className="home-step__title">{s.title}</h3>
                <p className="home-step__body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-trust" aria-labelledby="home-trust">
        <ShapeIcon shape="soft-square" tone="secondary" icon="shield" size={56} />
        <div className="home-trust__text">
          <h2 id="home-trust" className="home-trust__title">Your details stay private</h2>
          <p className="home-trust__body">
            Public listings never show photos or identifying details. Only the real owner can answer the questions that unlock a claim.
          </p>
        </div>
      </section>

      <p className="home-staff">
        Venue staff? <Link to="/login">Staff login</Link>
      </p>
    </div>
  );
}
