"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Placeholder uploader: generates a local preview URL only, no real storage backend yet.
    onChange(URL.createObjectURL(file));
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Product preview" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-text-secondary" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Paste an image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <Button type="button" variant="outline" size="icon" onClick={() => onChange("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload Image
        </Button>
        <p className="text-xs text-text-secondary">
          Placeholder uploader, stores a local preview only until real file storage is wired up.
        </p>
      </div>
    </div>
  );
}
