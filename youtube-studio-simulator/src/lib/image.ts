/** Read an image file and downscale it to a small JPEG data URL suitable for localStorage. */
export function fileToThumbnail(file: File, width = 480, height = 270): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        const scale = Math.max(width / img.width, height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
