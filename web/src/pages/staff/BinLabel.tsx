import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useGet } from '../../api/useApi';
import type { Bin } from '../../api/types';
import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { IconButton } from '../../components/m3/IconButton';
import './BinLabel.css';

/** Printable bin label. The QR encodes `vlf:bin:<code>`. */
export function BinLabel() {
  const { code } = useParams();
  const navigate = useNavigate();
  const bin = useGet<Bin[]>('/bins').data?.find((b) => b.code === code);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    if (code) QRCode.toString(`vlf:bin:${code}`, { type: 'svg', margin: 1, width: 240 }).then(setSvg);
  }, [code]);

  return (
    <div className="staff-label">
      <Card variant="elevated" className="staff-label__card">
        <div className="staff-label__bar">
          <IconButton icon="arrow_back" label="Back to bins" onClick={() => navigate('/staff/bins')} />
          <h1 className="staff-label__title">QR label</h1>
        </div>
        <div className="staff-label__paper">
          <div className="staff-label__qr" role="img" aria-label={`QR code for bin ${code}`} dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="staff-label__code">{code}</p>
          {bin?.label && <p className="staff-label__text">{bin.label}</p>}
        </div>
        <p className="staff-label__hint">Stick this on the bin. Scanning it during intake files items here.</p>
        <Button variant="filled" icon="print" full onClick={() => window.print()} className="staff-label__print">Print</Button>
      </Card>
    </div>
  );
}
