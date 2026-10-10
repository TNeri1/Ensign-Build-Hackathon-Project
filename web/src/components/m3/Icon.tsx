import { ICONS, type IconName } from './icons';

interface Props {
  name: IconName;
  /** px, default 24 (Material Symbols optical size). */
  size?: number;
  /** Use the FILL=1 variant when one is vendored (`<name>_filled`), e.g. the active nav destination. */
  filled?: boolean;
  className?: string;
  /** Accessible label. Omit for decorative icons (then aria-hidden). */
  title?: string;
}

/** Inline SVG icon from the vendored Material Symbols set. Inherits `currentColor`. */
export function Icon({ name, size = 24, filled = false, className, title }: Props) {
  const filledKey = `${name}_filled` as IconName;
  const d = filled && filledKey in ICONS ? ICONS[filledKey] : ICONS[name];
  return (
    <svg
      className={className ? `md-icon ${className}` : 'md-icon'}
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
