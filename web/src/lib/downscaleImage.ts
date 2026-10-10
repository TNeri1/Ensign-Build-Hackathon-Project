/** Size that fits inside max x max, keeping aspect ratio and never upscaling. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Shrink a phone photo (often 4-12 MB) to a JPEG of at most `max` px per side before sending it to the
 * vision model: much faster on a laptop-local model and plenty of detail. Falls back to the original file.
 */
export async function downscaleImage(file: File, max = 1024, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const size = fitWithin(bitmap.width, bitmap.height, max);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, size.width, size.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    return blob ?? file;
  } catch {
    return file;
  }
}
