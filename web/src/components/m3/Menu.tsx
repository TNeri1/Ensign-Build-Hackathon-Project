import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import type { IconName } from './icons';
import './Menu.css';

export interface MenuItem {
  label: string;
  icon?: IconName;
  /** Navigates with react-router. */
  to?: string;
  onClick?: () => void;
}

export interface MenuProps {
  /** Accessible name of the anchor icon button, e.g. "More actions". */
  anchorLabel: string;
  icon?: IconName;
  items: MenuItem[];
}

/**
 * Material 3 menu anchored to an icon button. Keyboard: Enter/Space/ArrowDown open on the first item,
 * ArrowUp on the last; Arrow keys / Home / End move; Escape closes and returns focus; Tab closes.
 * Outside click closes.
 */
export function Menu({ anchorLabel, icon = 'more_vert', items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{ up: boolean; start: boolean }>({ up: false, start: false });
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const initialIndex = useRef(0);
  const menuId = useId();

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) anchorRef.current?.focus();
  };
  const openAt = (index: number) => {
    initialIndex.current = index;
    setOpen(true);
  };

  // Flip up / to the start edge when the menu would overflow the viewport.
  useLayoutEffect(() => {
    if (!open || !menuRef.current || !wrapRef.current) return;
    const anchor = wrapRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    setPlacement({
      up: anchor.bottom + menu.height > window.innerHeight && anchor.top > menu.height,
      start: anchor.right - menu.width < 0,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const els = menuItems();
    const i = initialIndex.current < 0 ? els.length - 1 : initialIndex.current;
    els[i]?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onAnchorKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(-1);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = menuItems();
    const cur = els.indexOf(document.activeElement as HTMLElement);
    const move = (i: number) => els[(i + els.length) % els.length]?.focus();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(cur + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(cur - 1);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(els.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  const activate = (item: MenuItem) => {
    item.onClick?.();
    close(true);
  };

  const menuCls = ['md-menu', placement.up && 'md-menu--up', placement.start && 'md-menu--start']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="md-menu-anchor" ref={wrapRef}>
      <IconButton
        ref={anchorRef}
        icon={icon}
        label={anchorLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={onAnchorKeyDown}
      />
      {open && (
        <div id={menuId} ref={menuRef} className={menuCls} role="menu" aria-label={anchorLabel} onKeyDown={onMenuKeyDown}>
          {items.map((item) => {
            const content = (
              <>
                {item.icon && <Icon name={item.icon} size={24} className="md-menu__icon" />}
                <span className="md-menu__label">{item.label}</span>
              </>
            );
            return item.to ? (
              <Link
                key={item.label}
                to={item.to}
                role="menuitem"
                tabIndex={-1}
                className="md-menu__item"
                onClick={() => activate(item)}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="md-menu__item"
                onClick={() => activate(item)}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
