import { useEffect, useState } from 'react';

/** Live camera in the page (getUserMedia) needs a secure context: https, or http://localhost. */
export function canUseLiveCamera(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
}

/** Stop every track of a stream, so the camera light goes off. */
export function stopStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop());
}

/** Stop any camera streams still attached to <video> elements inside `root`. */
export function stopVideoStreams(root: Element): void {
  root.querySelectorAll('video').forEach((v) => {
    stopStream(v.srcObject as MediaStream | null);
    v.srcObject = null;
  });
}

/** False while the tab/app is in the background, so pages can release the camera. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}
