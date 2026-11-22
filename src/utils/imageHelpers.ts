export async function fileToBase64(file: File): Promise<{
  dataUrl: string;
  base64: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = dataUrl.indexOf(',');
      if (!dataUrl || commaIndex === -1) {
        reject(new Error('Could not read the selected image file.'));
        return;
      }
      const base64 = dataUrl.slice(commaIndex + 1);
      resolve({
        dataUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export async function urlToBase64(url: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      return { mimeType: match[1], base64: match[2] };
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load room image data.');
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = dataUrl.indexOf(',');
      if (!dataUrl || commaIndex === -1) {
        reject(new Error('Could not encode room image.'));
        return;
      }
      resolve({
        base64: dataUrl.slice(commaIndex + 1),
        mimeType: blob.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Failed to encode room image.'));
    reader.readAsDataURL(blob);
  });
}
