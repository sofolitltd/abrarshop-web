export type PixelCrop = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotatedBoundingBox(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Renders the given crop area (from react-easy-crop) with rotation applied
 * onto a canvas, and returns the result as a File.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation: number,
  fileName: string,
  mimeType: string = "image/jpeg"
): Promise<File> {
  const image = await createImage(imageSrc);

  const rotatedCanvas = document.createElement("canvas");
  const rotatedCtx = rotatedCanvas.getContext("2d");
  if (!rotatedCtx) throw new Error("Canvas is not supported in this browser.");

  const { width: bBoxWidth, height: bBoxHeight } = rotatedBoundingBox(image.width, image.height, rotation);
  rotatedCanvas.width = bBoxWidth;
  rotatedCanvas.height = bBoxHeight;

  rotatedCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  rotatedCtx.rotate(getRadianAngle(rotation));
  rotatedCtx.translate(-image.width / 2, -image.height / 2);
  rotatedCtx.drawImage(image, 0, 0);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = pixelCrop.width;
  outputCanvas.height = pixelCrop.height;
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) throw new Error("Canvas is not supported in this browser.");

  outputCtx.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    outputCanvas.toBlob(resolve, mimeType, 0.92)
  );
  if (!blob) throw new Error("Failed to export cropped image.");

  const ext = mimeType === "image/png" ? "png" : "jpg";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}-cropped.${ext}`, { type: mimeType });
}
