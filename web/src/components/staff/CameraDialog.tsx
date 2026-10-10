import { useEffect, useRef, useState } from 'react';
import { stopStream, usePageVisible } from '../../lib/camera';
import { Alert } from '../m3/Alert';
import { Button } from '../m3/Button';
import { Dialog } from '../m3/Dialog';
import './CameraDialog.css';

interface Props {
  open: boolean;
  onClose(): void;
  onCapture(file: File): void;
  /** Use the phone's own camera app instead (native file input with capture). */
  onFallback(): void;
}

/**
 * In-app camera: live viewfinder + shutter, so "Take photo" opens the camera on every device (desktop webcams too),
 * not the file browser. The camera runs only while the dialog is open and the tab is visible.
 */
export function CameraDialog({ open, onClose, onCapture, onFallback }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const visible = usePageVisible();

  useEffect(() => {
    if (!open || !visible) return;
    let stream: MediaStream | null = null;
    let disposed = false;
    setReady(false);
    setError('');
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (disposed) return stopStream(s); // dialog closed while the camera was starting
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
      })
      .catch((e: unknown) => { if (!disposed) setError(`Camera unavailable (${(e as Error).name ?? String(e)}).`); });
    const v = video.current;
    return () => {
      disposed = true;
      stopStream(stream);
      if (v) v.srcObject = null;
      setReady(false);
    };
  }, [open, visible]);

  function capture() {
    const v = video.current;
    if (!v || !ready || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d')?.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return setError('Could not capture the photo. Try again.');
      onCapture(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      onClose();
    }, 'image/jpeg', 0.9);
  }

  return (
    <Dialog open={open} title="Take photo" icon="photo_camera" confirmLabel={ready ? 'Capture' : 'Starting…'} onConfirm={capture} onClose={onClose}>
      <div className="camera-dialog">
        <video ref={video} className="camera-dialog__video" playsInline muted autoPlay onLoadedMetadata={() => setReady(true)} aria-label="Camera preview" />
        {!ready && !error && <p className="camera-dialog__hint md-typescale-body-medium">Starting camera…</p>}
        {error && (
          <Alert kind="warning" action={<Button variant="text" icon="photo_camera" onClick={onFallback}>Use camera app</Button>}>
            {error}
          </Alert>
        )}
      </div>
    </Dialog>
  );
}
