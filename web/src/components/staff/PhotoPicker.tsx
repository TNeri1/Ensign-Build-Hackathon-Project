import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../m3/Icon';
import { IconButton } from '../m3/IconButton';
import './PhotoPicker.css';

interface Props {
  file: File | null;
  onChange(file: File | null): void;
}

/**
 * Large tappable "Add photo" card over a native file input (opens the rear camera on phones).
 * Shows a preview once a photo is chosen. Setting `file` to null also clears the native input.
 */
export function PhotoPicker({ file, onChange }: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      if (input.current) input.current.value = '';
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
            <span className="photo-picker__icon">
              <Icon name="photo_camera" size={32} />
            </span>
            <span className="md-typescale-title-medium">Add photo</span>
            <span className="md-typescale-body-medium md-on-surface-variant">Tap to take a picture (optional)</span>
          </span>
        )}
      </label>
      {preview && (
        <IconButton icon="close" label="Remove photo" variant="tonal" className="photo-picker__remove" onClick={() => onChange(null)} />
      )}
    </div>
  );
}
