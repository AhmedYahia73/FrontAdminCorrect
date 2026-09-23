/**
 * Smart Client-Side Image Optimizer
 * Resizes and compresses images in the browser using Native Canvas API.
 * Drastically reduces upload bandwidth and prevents browser tab OOM.
 */

export async function optimizeImage(file, { maxDimension = 2048, quality = 0.85 } = {}) {
  // If not an image or already under 250KB, keep as is
  if (!file.type.startsWith('image/') || file.size < 250 * 1024) {
    return file;
  }

  // SVG images shouldn't be rasterized/compressed via canvas
  if (file.type === 'image/svg+xml') {
    return file;
  }

  try {
    let bitmap;
    if (typeof createImageBitmap === 'function') {
      bitmap = await createImageBitmap(file);
    } else {
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image for optimization'));
        };
        img.src = url;
      });
    }

    let { width, height } = bitmap;

    // Check if resize is needed
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    } else if (file.size < 600 * 1024) {
      // If dimensions are within bounds and size is reasonable, no compression needed
      if (typeof bitmap.close === 'function') bitmap.close();
      return file;
    }

    // Render to canvas
    let blob;
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    }

    if (typeof bitmap.close === 'function') {
      bitmap.close();
    }

    if (!blob || blob.size >= file.size) {
      // If optimization didn't reduce size, stick to original
      return file;
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    return new File([blob], cleanName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.warn(`Optimization skipped for ${file.name}:`, err);
    return file;
  }
}

/**
 * Optimizes an array of files in sequence or small batches with progress callback.
 */
export async function optimizeImages(files, onProgress) {
  const optimizedFiles = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const opt = await optimizeImage(file);
    optimizedFiles.push(opt);
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return optimizedFiles;
}
