import imageCompression from "browser-image-compression";

const SQUARE_SIZE = 500;

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Detects the bounding box of the actual product (as opposed to the empty
 * background margin around it) so the subject can be scaled to fill more of
 * the final 500x500 frame instead of looking tiny in a sea of white space.
 *
 * Works by estimating the background color from the image's border pixels,
 * then finding the extent of pixels that differ meaningfully from it. No AI
 * model involved — just a fast pixel scan on a downscaled copy. Returns
 * `null` whenever the result isn't trustworthy (near-uniform image, or
 * detected content already fills almost the whole frame) so callers safely
 * fall back to using the full original image.
 */
function detectContentBoundingBox(bitmap: ImageBitmap): Rect | null {
  const maxAnalysisDim = 300;
  const scale = Math.min(1, maxAnalysisDim / Math.max(bitmap.width, bitmap.height));
  const aw = Math.max(1, Math.round(bitmap.width * scale));
  const ah = Math.max(1, Math.round(bitmap.height * scale));

  const analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = aw;
  analysisCanvas.height = ah;
  const actx = analysisCanvas.getContext("2d", { willReadFrequently: true });
  if (!actx) return null;
  actx.drawImage(bitmap, 0, 0, aw, ah);

  let data: Uint8ClampedArray;
  try {
    data = actx.getImageData(0, 0, aw, ah).data;
  } catch {
    // Tainted canvas (shouldn't happen for local files) — skip trimming.
    return null;
  }

  // Estimate the background color by sampling pixels along the border.
  let bgR = 0, bgG = 0, bgB = 0, sampleCount = 0;
  const stepX = Math.max(1, Math.floor(aw / 20));
  const stepY = Math.max(1, Math.floor(ah / 20));
  const sample = (x: number, y: number) => {
    const idx = (y * aw + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
    sampleCount++;
  };
  for (let x = 0; x < aw; x += stepX) {
    sample(x, 0);
    sample(x, ah - 1);
  }
  for (let y = 0; y < ah; y += stepY) {
    sample(0, y);
    sample(aw - 1, y);
  }
  if (sampleCount === 0) return null;
  bgR /= sampleCount;
  bgG /= sampleCount;
  bgB /= sampleCount;

  const THRESHOLD = 28;
  let minX = aw, minY = ah, maxX = -1, maxY = -1;

  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const idx = (y * aw + x) * 4;
      const dr = data[idx] - bgR;
      const dg = data[idx + 1] - bgG;
      const db = data[idx + 2] - bgB;
      if (Math.sqrt(dr * dr + dg * dg + db * db) > THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const foundWidth = maxX - minX + 1;
  const foundHeight = maxY - minY + 1;
  const areaRatio = (foundWidth * foundHeight) / (aw * ah);
  // Already fills the frame (nothing meaningful to trim) or looks like noise
  // from a non-uniform background — leave the original framing untouched.
  if (areaRatio > 0.95 || areaRatio < 0.02) return null;

  // Small breathing room around the detected subject.
  const padX = foundWidth * 0.04;
  const padY = foundHeight * 0.04;
  const trimMinX = Math.max(0, minX - padX);
  const trimMinY = Math.max(0, minY - padY);
  const trimMaxX = Math.min(aw, maxX + 1 + padX);
  const trimMaxY = Math.min(ah, maxY + 1 + padY);

  const inv = 1 / scale;
  return {
    x: trimMinX * inv,
    y: trimMinY * inv,
    width: (trimMaxX - trimMinX) * inv,
    height: (trimMaxY - trimMinY) * inv,
  };
}

/**
 * Makes sure every product image is exactly 500x500. If the image is
 * already that exact size, it's left untouched. Otherwise the product is
 * detected and tightly framed (see detectContentBoundingBox), then scaled
 * to fit (preserving aspect ratio) and centered on a 500x500 white canvas —
 * no distortion, just consistent framing and padding.
 */
async function ensureSquareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    if (bitmap.width === SQUARE_SIZE && bitmap.height === SQUARE_SIZE) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = SQUARE_SIZE;
    canvas.height = SQUARE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    const crop = detectContentBoundingBox(bitmap);
    const sx = crop?.x ?? 0;
    const sy = crop?.y ?? 0;
    const sw = crop?.width ?? bitmap.width;
    const sh = crop?.height ?? bitmap.height;

    const scale = Math.min(SQUARE_SIZE / sw, SQUARE_SIZE / sh);
    const drawWidth = sw * scale;
    const drawHeight = sh * scale;
    const dx = (SQUARE_SIZE - drawWidth) / 2;
    const dy = (SQUARE_SIZE - drawHeight) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
    ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, drawWidth, drawHeight);
    bitmap.close();

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, 0.92)
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const ext = outputType === "image/png" ? "png" : "jpg";
    return new File([blob], `${baseName}-500x500.${ext}`, { type: outputType });
  } catch (error) {
    console.error("Failed to resize image to 500x500, uploading original file:", error);
    return file;
  }
}

/**
 * Compresses an image file in the browser before it is uploaded.
 * Keeps file size and dimensions sane so Cloudinary storage/bandwidth
 * and page load times stay fast, regardless of how large the original
 * camera photo is (phone cameras routinely produce 3-15MB originals).
 * Also guarantees every image ends up exactly 500x500.
 */
export async function compressImageFile(file: File): Promise<File> {
  // Not a raster image we can safely re-encode (e.g. SVG) — leave as-is.
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  const squared = await ensureSquareImage(file);

  try {
    const compressed = await imageCompression(squared, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: SQUARE_SIZE,
      useWebWorker: true,
      initialQuality: 0.8,
    });

    // The web-worker path can resolve with a plain Blob instead of a real
    // File instance, which breaks `instanceof File` checks used elsewhere
    // (e.g. preview generation). Always re-wrap to guarantee a File.
    const asFile = (blob: Blob): File =>
      blob instanceof File ? blob : new File([blob], squared.name, { type: blob.type || squared.type });

    // Guard against the rare case compression produced a larger file.
    return compressed.size < squared.size ? asFile(compressed) : squared;
  } catch (error) {
    console.error("Image compression failed, uploading resized file:", error);
    return squared;
  }
}
