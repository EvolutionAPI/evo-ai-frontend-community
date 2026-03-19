import type { Area } from 'react-easy-crop';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

export const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
): Promise<{ blob: Blob; url: string }> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(file => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/jpeg');
  });

  return { blob, url: URL.createObjectURL(blob) };
};
