import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../m3/Icon';
import { ShapeIcon } from '../m3/ExpressiveShape';
import { canUseLiveCamera } from '../../lib/camera';
import { Button } from '../m3/Button';
import { IconButton } from '../m3/IconButton';
import { CameraDialog } from './CameraDialog';
import './PhotoPicker.css';

interface Props {
  file: File | null;
  onChange(file: File | null): void;
}

/**
 * Large tappable "Add photo" card: opens the in-app camera (CameraDialog) where live camera access is allowed
 * (https or localhost), else the native input with capture="environment" (the phone's camera app). Plus an
 * "Upload photo" button for an existing picture (gallery / files). Shows a preview once chosen.
 * Setting `file` to null also clears the native inputs.
 */
export function PhotoPicker({ file, onChange }: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const nativeCamera = useRef(false);

  useEffect(() => {
    if (!file) {
      if (input.current) input.current.value = '';
      if (upload.current) upload.current.value = '';
      return setPreview(null);
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className={`photo-picker${preview ? ' photo-picker--filled' : ''}`}>
      <input
        id={id}
        ref={input}
        className="photo-picker__input md-visually-hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onClick={(e) => {
          // Label tap or keyboard: prefer the in-app camera; the native picker only as fallback.
          if (!nativeCamera.current && canUseLiveCamera()) { e.preventDefault(); setCameraOpen(true); }
          nativeCamera.current = false;
        }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <label htmlFor={id} className="photo-picker__target">
        {preview ? (
          <>
            <img className="photo-picker__preview" src={preview} alt="Selected item photo" />
            <span className="photo-picker__retake md-typescale-label-large">
              <Icon name="photo_camera" size={18} /> Retake
            </span>
          </>
        ) : (
          <span className="photo-picker__empty">
            <ShapeIcon shape="sunny" tone="primary" icon="photo_camera" size={88} className="photo-picker__icon" />
            <span className="photo-picker__title">Add photo</span>
            <span className="md-typescale-body-medium md-on-surface-variant">Tap to take a picture (optional)</span>
          </span>
        )}
      </label>
      <input
        ref={upload}
        className="md-visually-hidden"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <div className="photo-picker__actions">
        <Button variant="text" icon="image" onClick={() => upload.current?.click()}>
          {preview ? 'Choose a different photo' : 'Upload photo'}
        </Button>
      </div>
      <CameraDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onChange}
        onFallback={() => { setCameraOpen(false); nativeCamera.current = true; input.current?.click(); }}
      />
      {preview && (
        <IconButton icon="close" label="Remove photo" variant="tonal" className="photo-picker__remove" onClick={() => onChange(null)} />
      )}
    </div>
  );
}
