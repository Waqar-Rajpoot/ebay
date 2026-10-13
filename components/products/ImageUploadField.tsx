"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractApiError } from "@/lib/api/apiError";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/lib/images/imageConstants";
import { uploadImageRequest } from "@/lib/images/imageApi";
import type { UploadedImage } from "@/lib/images/imageTypes";
import { getImageFileError } from "@/lib/images/imageValidation";

interface ImageUploadFieldProps {
  imageUrl: string;
  error?: string;
  onUploaded: (image: UploadedImage) => void;
  onRemoved: () => void;
}

/** Uploads a product image to ImageKit and shows its preview and hosted URL. */
export default function ImageUploadField({ imageUrl, error, onUploaded, onRemoved }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be chosen again after removal
    if (!file) return;

    const fileError = getImageFileError(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsUploading(true);
    try {
      onUploaded(await uploadImageRequest(file));
      toast.success("Image uploaded");
    } catch (uploadError) {
      toast.error(extractApiError(uploadError).message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUpload">Product image</Label>

      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-md border">
            <Image
              src={imageUrl}
              alt="Uploaded product preview"
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2"
              onClick={onRemoved}
              aria-label="Remove image"
            >
              <X className="size-4" />
            </Button>
          </div>
          <Input value={imageUrl} readOnly aria-label="Image URL" className="text-xs" />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-28 w-full border-dashed"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          {isUploading ? "Uploading…" : "Choose an image (JPEG, PNG or WebP)"}
        </Button>
      )}

      <input
        ref={fileInputRef}
        id="imageUpload"
        type="file"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleFileSelected}
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}