const TARGET_SIZE = 1.5 * 1024 * 1024;

async function renderToBlob(
  bitmap: ImageBitmap,
  maxDim: number,
  quality: number,
): Promise<Blob | null> {
  const ratio = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  try {
    const dims = [1600, 1200, 900];
    const qualities = [0.85, 0.7, 0.55, 0.4];
    let best: Blob | null = null;

    for (const dim of dims) {
      for (const q of qualities) {
        const blob = await renderToBlob(bitmap, dim, q);
        if (!blob) continue;
        best = blob;
        if (blob.size <= TARGET_SIZE) {
          const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          return new File([blob], newName, { type: "image/jpeg" });
        }
      }
    }

    if (best && best.size < file.size) {
      const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      return new File([best], newName, { type: "image/jpeg" });
    }
    return file;
  } finally {
    bitmap.close();
  }
}
