"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_MB = 5;

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary subfolder the image is stored in. */
  folder?: "products" | "logos";
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  allowed_formats: string;
  folder: string;
  timestamp: number;
  signature: string;
}

// Serve Cloudinary images in the best format/quality for each browser, capped at 1200px wide.
function optimizedUrl(secureUrl: string) {
  return secureUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1200/");
}

async function uploadToCloudinary(file: File, folder: string) {
  const signatureResponse = await fetch("/api/uploads/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const signed = (await signatureResponse.json().catch(() => null)) as
    | (UploadSignature & { message?: string })
    | null;
  if (!signatureResponse.ok || !signed?.signature) {
    throw new Error(signed?.message ?? "Could not prepare the upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("allowed_formats", signed.allowed_formats);
  formData.append("folder", signed.folder);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const uploaded = await uploadResponse.json().catch(() => null);
  if (!uploadResponse.ok || !uploaded?.secure_url) {
    throw new Error(uploaded?.error?.message ?? "Upload failed, please try again");
  }

  return optimizedUrl(uploaded.secure_url as string);
}

export function ImageUploadField({ value, onChange, folder = "products" }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still triggers a change event.
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      onChange(await uploadToCloudinary(file, folder));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Image preview" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-text-secondary" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Paste an image URL"
            value={value}
            disabled={uploading}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={uploading}
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        {error ? (
          <p className="text-xs text-danger">{error}</p>
        ) : (
          <p className="text-xs text-text-secondary">
            JPG, PNG, WebP, AVIF or GIF, up to {MAX_FILE_SIZE_MB} MB.
          </p>
        )}
      </div>
    </div>
  );
}
