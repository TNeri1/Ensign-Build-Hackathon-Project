import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { stopVideoStreams, usePageVisible } from '../lib/camera';
import { Alert } from './m3/Alert';
import { Icon } from './m3/Icon';
import './QrScanner.css';

let seq = 0;

// html5-qrcode calls video.play() internally and never catches it. When we shut the camera down while it is
// still starting (leaving the page fast), that promise rejects with this AbortError. Expected; don't report it.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as { name?: string; message?: string } | undefined;
    if (r?.name === 'AbortError' && /play\(\) request was interrupted/.test(r.message ?? '')) e.preventDefault();
  });
}

/**
 * Camera QR scanner (html5-qrcode). Calls onScan once per code (re-arms after 3s). Needs https or localhost.
 * The camera runs ONLY while this component is mounted and the tab is visible. Every start gets its own
 * element and is released even if it finishes starting after the page was left (React StrictMode mounts twice).
 */
export function QrScanner({ onScan }: { onScan(text: string): void }) {
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const last = useRef('');
  const cb = useRef(onScan);
  cb.current = onScan;
  const visible = usePageVisible();

  useEffect(() => {
    if (!visible || !host.current) return;
    const el = document.createElement('div');
    el.id = `qr-reader-${++seq}`;
    host.current.appendChild(el);
    const scanner = new Html5Qrcode(el.id);
    let started = false;
    let disposed = false;
    const release = () => {
      stopVideoStreams(el);
      el.remove();
    };
    const stop = () => scanner.stop().catch(() => {}).finally(release);

    scanner
      .start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, (text) => {
        if (text !== last.current) {
          last.current = text;
          cb.current(text);
          setTimeout(() => { last.current = ''; }, 3000); // allow a retry after a few seconds
        }
      }, () => {})
      .then(() => {
        if (disposed) return void stop(); // page was left while the camera was starting
        started = true;
        setLive(true);
        setError('');
      })
      .catch((e: unknown) => {
        if (disposed) return release();
        setError(`Camera unavailable (${String(e)}). Enter the code manually instead.`);
      });

    return () => {
      disposed = true;
      setLive(false);
      if (started) void stop();
    };
  }, [visible]);

  return (
    <div className="qr-scanner">
      <div className={`qr-scanner__viewfinder${live ? ' qr-scanner__viewfinder--live' : error ? ' qr-scanner__viewfinder--off' : ''}`}>
        {!live && (
          <div className="qr-scanner__placeholder" aria-hidden="true">
            <span className="qr-scanner__frame" />
            <Icon name={error ? 'photo_camera' : 'qr_code_scanner'} size={48} />
            <span className="qr-scanner__hint">{error ? 'Camera off' : visible ? 'Starting camera…' : 'Camera paused'}</span>
          </div>
        )}
        <div id="qr-reader" ref={host} style={{ width: '100%' }} />
      </div>
      {error && <Alert kind="warning">{error}</Alert>}
    </div>
  );
}
