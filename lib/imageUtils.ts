export const removeChromaKey = (
  imageDataUrl: string,
  keyColor: { r: number; g: number; b: number } = { r: 0, g: 255, b: 0 }, // Chroma Key Green
  tolerance: number = 60
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const toleranceSq = tolerance * tolerance;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distanceSq =
          Math.pow(r - keyColor.r, 2) +
          Math.pow(g - keyColor.g, 2) +
          Math.pow(b - keyColor.b, 2);

        if (distanceSq < toleranceSq) {
          // Set alpha to 0 to make it transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = (err) => {
        const errorMessage = typeof err === 'string' ? err : 'Image loading failed.';
        reject(new Error(errorMessage));
    };
    image.src = imageDataUrl;
  });
};