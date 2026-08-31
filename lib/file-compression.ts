/**
 * Maximum allowed original upload size: 1 MB (1,048,576 bytes)
 */
export const MAX_ORIGINAL_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Maximum allowed file size for Google Drive Form Uploads: 300 KB (307,200 bytes)
 */
export const MAX_COMPRESSED_SIZE_BYTES = 300 * 1024; // 307,200 bytes

export interface CompressionResult {
  file: File;
  blob: Blob;
  fileName: string;
  mimeType: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  isCompressed: boolean;
}

/**
 * Checks if a file is an image based on its MIME type or file extension.
 */
export function isImageMimeType(mimeType: string, fileName?: string): boolean {
  if (mimeType.startsWith("image/") && !mimeType.includes("svg")) {
    return true;
  }
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext || "");
  }
  return false;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas / OffscreenCanvas
 * preserving its ORIGINAL format (JPG stays JPG, PNG stays PNG, WEBP stays WEBP)
 * to ensure the final output is strictly <= 300 KB (307,200 bytes).
 */
export async function compressImageToMax300KB(
  file: File,
  onProgress?: (stage: string) => void
): Promise<CompressionResult> {
  const originalSizeBytes = file.size;

  // Determine original image format strictly
  const lowerName = file.name.toLowerCase();
  const isPng = file.type === "image/png" || lowerName.endsWith(".png");
  const isWebp = file.type === "image/webp" || lowerName.endsWith(".webp");

  let targetMime = "image/jpeg";
  let extension = lowerName.endsWith(".jpeg") ? ".jpeg" : ".jpg";

  if (isPng) {
    targetMime = "image/png";
    extension = ".png";
  } else if (isWebp) {
    targetMime = "image/webp";
    extension = ".webp";
  }

  // If already under 300 KB, return the original file in its native format
  if (originalSizeBytes <= MAX_COMPRESSED_SIZE_BYTES) {
    return {
      file,
      blob: file,
      fileName: file.name,
      mimeType: file.type || targetMime,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      isCompressed: false,
    };
  }

  onProgress?.("Reading image...");

  // Load image into HTMLImageElement
  const imageBitmap = await loadImage(file);
  const originalWidth = imageBitmap.naturalWidth || imageBitmap.width;
  const originalHeight = imageBitmap.naturalHeight || imageBitmap.height;

  onProgress?.("Optimizing resolution & file size...");

  // Start with max dimension 1920px (preserving aspect ratio)
  let width = originalWidth;
  let height = originalHeight;
  const maxInitialDimension = 1920;

  if (width > maxInitialDimension || height > maxInitialDimension) {
    if (width > height) {
      height = Math.round((height * maxInitialDimension) / width);
      width = maxInitialDimension;
    } else {
      width = Math.round((width * maxInitialDimension) / height);
      height = maxInitialDimension;
    }
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image compression.");
  }

  let bestBlob: Blob | null = null;

  if (isPng) {
    // For PNG: iterative dimension downscaling to keep lossless PNG format under 300 KB
    const dimensionSteps = [1.0, 0.85, 0.70, 0.58, 0.48, 0.38, 0.30];

    for (const scale of dimensionSteps) {
      const curW = Math.max(100, Math.round(width * scale));
      const curH = Math.max(100, Math.round(height * scale));

      canvas.width = curW;
      canvas.height = curH;
      ctx.clearRect(0, 0, curW, curH);
      ctx.drawImage(imageBitmap, 0, 0, curW, curH);

      onProgress?.(`Optimizing PNG dimensions (${curW}×${curH})...`);
      const blob = await canvasToBlob(canvas, "image/png");

      if (blob && blob.size <= MAX_COMPRESSED_SIZE_BYTES) {
        bestBlob = blob;
        break;
      }
    }
  } else {
    // For JPEG / WebP: iterative quality and dimension stepping
    const qualitySteps = [0.90, 0.82, 0.74, 0.65, 0.55, 0.45, 0.35];

    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // If JPEG, fill white background for transparent pixels
      if (targetMime === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(imageBitmap, 0, 0, width, height);

      for (const quality of qualitySteps) {
        onProgress?.(`Compressing (${Math.round(quality * 100)}% quality)...`);
        const blob = await canvasToBlob(canvas, targetMime, quality);

        if (blob && blob.size <= MAX_COMPRESSED_SIZE_BYTES) {
          bestBlob = blob;
          break;
        }
      }

      if (bestBlob && bestBlob.size <= MAX_COMPRESSED_SIZE_BYTES) {
        break;
      }

      // Scale down dimensions by 20% and try again
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);

      if (width < 200 || height < 200) {
        break;
      }
    }
  }

  if (!bestBlob || bestBlob.size > MAX_COMPRESSED_SIZE_BYTES) {
    throw new Error(
      "This image could not be compressed below the maximum allowed size of 300 KB. Please choose a smaller image."
    );
  }

  // Preserve original base name with correct extension
  const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
  const newFileName = `${originalBaseName}${extension}`;
  const compressedFile = new File([bestBlob], newFileName, { type: targetMime });

  onProgress?.("Compression complete");

  return {
    file: compressedFile,
    blob: bestBlob,
    fileName: newFileName,
    mimeType: targetMime,
    originalSizeBytes,
    compressedSizeBytes: bestBlob.size,
    isCompressed: true,
  };
}

/**
 * Handles general file validation and compression check.
 * If file is an image, it is compressed to <= 300 KB in its original format.
 * If file is non-image (PDF, doc), verifies it is already <= 300 KB.
 */
export async function processAndCompressFormFile(
  file: File,
  onProgress?: (stage: string) => void
): Promise<CompressionResult> {
  // Check 1 MB upload limit
  if (file.size > MAX_ORIGINAL_FILE_SIZE_BYTES) {
    throw new Error(
      `"${file.name}" exceeds the maximum allowed file size of 1 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a file up to 1 MB.`
    );
  }

  if (isImageMimeType(file.type, file.name)) {
    return compressImageToMax300KB(file, onProgress);
  }

  // Non-image file (e.g. PDF, doc)
  if (file.size > MAX_COMPRESSED_SIZE_BYTES) {
    throw new Error(
      `This file (${(file.size / 1024).toFixed(0)} KB) exceeds the maximum allowed size of 300 KB. Please upload a PDF under 300 KB.`
    );
  }

  return {
    file,
    blob: file,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    originalSizeBytes: file.size,
    compressedSizeBytes: file.size,
    isCompressed: false,
  };
}

/**
 * Helper to load an image File/Blob into an HTMLImageElement.
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for processing."));
    };

    img.src = url;
  });
}

/**
 * Helper to export a canvas to a Blob.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}
