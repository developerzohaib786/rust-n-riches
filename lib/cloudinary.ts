import { createHash } from "crypto";

import { ApiError } from "@/lib/api-error";

// Subfolders (under CLOUDINARY_UPLOAD_FOLDER) that the admin UI may upload into.
export const UPLOAD_FOLDERS = ["products", "logos"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const ALLOWED_IMAGE_FORMATS = "jpg,jpeg,png,webp,avif,gif";

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(503, "Image uploads are not configured yet. Add the Cloudinary keys to .env.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    rootFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "rust-n-riches",
  };
}

// Cloudinary's signature: params sorted by key, joined as a query string, suffixed
// with the API secret, then SHA-1 hashed. See cloudinary.com/documentation/authentication_signatures
export function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}
