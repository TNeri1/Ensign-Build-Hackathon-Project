import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState('');
  useEffect(() => { QRCode.toString(value, { type: 'svg', margin: 1, width: size }).then(setSvg); }, [value, size]);
  return <div className="qr" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
