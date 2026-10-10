import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Alert } from './m3/Alert';
import { Icon } from './m3/Icon';
import './QrScanner.css';

/** Camera QR scanner (html5-qrcode). Calls onScan once per code (re-arms after 3s). Needs https or localhost. */
export function QrScanner({ onScan }: { onScan(text: string): void }) {
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const last = useRef('');
  const cb = useRef(onScan);
  cb.current = onScan;

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    let started = false;
    scanner
      .start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, (text) => {
        if (text !== last.current) {
          last.current = text;
          cb.current(text);
          setTimeout(() => { last.current = ''; }, 3000); // allow a retry after a few seconds
        }
      }, () => {})
      .then(() => { started = true; setLive(true); })
      .catch((e: unknown) => setError(`Camera unavailable (${String(e)}). Enter the code manually instead.`));
    return () => { if (started) scanner.stop().then(() => scanner.clear()).catch(() => {}); };
  }, []);

  return (
    <div className="qr-scanner">
      <div className={`qr-scanner__viewfinder${live ? ' qr-scanner__viewfinder--live' : error ? ' qr-scanner__viewfinder--off' : ''}`}>
        {!live && (
          <div className="qr-scanner__placeholder" aria-hidden="true">
            <span className="qr-scanner__frame" />
            <Icon name={error ? 'photo_camera' : 'qr_code_scanner'} size={48} />
            <span className="qr-scanner__hint">{error ? 'Camera off' : 'Starting camera…'}</span>
          </div>
        )}
        <div id="qr-reader" style={{ width: '100%' }} />
      </div>
      {error && <Alert kind="warning">{error}</Alert>}
    </div>
  );
}
