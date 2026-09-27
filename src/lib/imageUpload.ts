const MAX_UPLOAD_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export function compressImageToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('The selected file is not a valid image.'));
    };
    image.onload = () => {
      const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Your browser could not prepare the image for upload.'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          reject(new Error('Your browser could not prepare the image for upload.'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', JPEG_QUALITY);
    };
    image.src = objectUrl;
  });
}
