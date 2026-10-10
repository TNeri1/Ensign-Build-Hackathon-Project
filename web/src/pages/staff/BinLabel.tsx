import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';

/** Printable bin label. The QR encodes `vlf:bin:<code>`. */
export function BinLabel() {
  const { code } = useParams();
  const bin = useGet<Bin[]>('/bins').data?.find((b) => b.code === code);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    if (code) QRCode.toString(`vlf:bin:${code}`, { type: 'svg', margin: 1, width: 240 }).then(setSvg);
  }, [code]);

  return (
    <div className="label-sheet">
      <div className="label" dangerouslySetInnerHTML={{ __html: svg }} />
      <h1 className="label-code">{code}</h1>
      <p>{bin?.label}</p>
      <button className="primary no-print" onClick={() => window.print()}>Print</button>
    </div>
  );
}
