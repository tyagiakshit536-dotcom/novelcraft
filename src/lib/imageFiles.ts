export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Image is too large. Please use an image smaller than 8MB.');
  }

  const image = await loadImageFromFile(file);
  const { width, height } = fitInside(image.width, image.height, 1600);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to process image file.');
  }

  ctx.drawImage(image, 0, 0, width, height);

  // Compress aggressively enough to keep persisted app state stable across refreshes.
  let quality = 0.9;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  const targetBytes = 700 * 1024;

  while (estimateDataUrlBytes(dataUrl) > targetBytes && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL('image/webp', quality);
  }

  if (estimateDataUrlBytes(dataUrl) > 2 * 1024 * 1024) {
    throw new Error('Image is too large after processing. Please use a smaller image.');
  }

  return dataUrl;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image file.'));
    };
    img.src = url;
  });
}

function fitInside(width: number, height: number, maxSide: number): { width: number; height: number } {
  if (width <= maxSide && height <= maxSide) {
    return { width, height };
  }
  const scale = Math.min(maxSide / width, maxSide / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function estimateDataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}
