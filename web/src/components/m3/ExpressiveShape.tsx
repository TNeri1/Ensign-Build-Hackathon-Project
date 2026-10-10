import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './ExpressiveShape.css';

/** M3 Expressive shape set, drawn as polar curves r(θ) = 1 + amp·cos(lobes·θ) in a 100×100 box. */
export type ShapeName = 'circle' | 'cookie' | 'clover' | 'sunny' | 'flower' | 'puffy' | 'soft-square';
const SPEC: Record<ShapeName, [lobes: number, amp: number, rotate: number]> = {
  circle: [1, 0, 0],
  cookie: [9, 0.06, 0],
  clover: [4, 0.2, 45],
  sunny: [8, 0.09, 0],
  flower: [6, 0.13, 0],
  puffy: [5, 0.08, -90],
  'soft-square': [4, 0.07, 45],
};

const cache = new Map<ShapeName, string>();
export function shapePath(shape: ShapeName): string {
  const hit = cache.get(shape);
  if (hit) return hit;
  const [lobes, amp, rot] = SPEC[shape];
  const steps = 96;
  const r0 = 50 / (1 + amp);
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = r0 * (1 + amp * Math.cos(lobes * t));
    const a = t + (rot * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  const d = `M${pts.join('L')}Z`;
  cache.set(shape, d);
  return d;
}

export type ShapeTone = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'surface';

interface Props {
  shape?: ShapeName;
  icon?: IconName;
  tone?: ShapeTone;
  /** Box size in px (icon is ~45% of it). */
  size?: number;
  className?: string;
  /** Slowly rotate the shape (decorative; off with reduced motion). */
  spin?: boolean;
}

/** An icon sitting in an expressive shape (cookie, clover, ...). Decorative: aria-hidden. */
export function ShapeIcon({ shape = 'cookie', icon, tone = 'primary', size = 48, className, spin }: Props) {
  const style = { '--_size': `${size}px` } as CSSProperties;
  return (
    <span className={`md-shape-icon md-shape-icon--${tone}${spin ? ' md-shape-icon--spin' : ''}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="md-shape-icon__shape" focusable="false"><path d={shapePath(shape)} /></svg>
      {icon && <Icon name={icon} size={Math.round(size * 0.46)} className="md-shape-icon__icon" />}
    </span>
  );
}
