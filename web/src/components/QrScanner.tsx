import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/** Camera QR scanner (html5-qrcode). Calls onScan once per distinct code. Needs https or localhost. */
export function QrScanner({ onScan }: { onScan(text: string): void }) {
  const [error, setError] = useState('');
  const last = useRef('');
  const cb = useRef(onScan);
  cb.current = onScan;

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    let started = false;
    scanner
      .start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, (text) => {
        if (text !== last.current) { last.current = text; cb.current(text); }
      }, () => {})
      .then(() => { started = true; })
      .catch((e: unknown) => setError(`Camera unavailable (${String(e)}). Use manual entry below.`));
    return () => { if (started) scanner.stop().then(() => scanner.clear()).catch(() => {}); };
  }, []);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%' }} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
