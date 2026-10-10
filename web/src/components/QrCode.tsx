import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import './QrCode.css';

/** Pickup QR. Always dark-on-white (even in dark theme) so scanners can read it. */
export function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState('');
  useEffect(() => { QRCode.toString(value, { type: 'svg', margin: 1, width: size }).then(setSvg); }, [value, size]);
  return (
    <div className="qr-code" role="img" aria-label="Pickup QR code">
      <div className="qr-code__svg" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
