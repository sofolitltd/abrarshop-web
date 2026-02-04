"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
  value: (string | File)[];
  onChange: (value: (string | File)[]) => void;
  disabled?: boolean;
  aspectRatio?: "square" | "video";
  maxImages?: number;
};

export function ImageUploader({ value, onChange, disabled = false, aspectRatio = "square", maxImages = 10 }: ImageUploaderProps) {
  const [localImages, setLocalImages] = useState<(string | File)[]>(value || []);
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setLocalImages(value || []);
  }, [value]);

  useEffect(() => {
    const newPreviews = new Map();
    const currentFiles = new Set();
    localImages.forEach(img => {
      if (img instanceof File) {
        newPreviews.set(img, URL.createObjectURL(img));
        currentFiles.add(img);
      }
    });

    // Clean up old previews
    previews.forEach((url, file) => {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url);
      }
    });

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    onChange([...localImages, ...Array.from(files)]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...localImages];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    // Set effect allowed to move to indicate reordering
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    // Only update if we are actively dragging an item (not a file upload drag)
    if (dragItem.current !== null) {
      dragOverItem.current = index;
    }
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newImages = [...localImages];
      const draggedItem = newImages.splice(dragItem.current, 1)[0];
      newImages.splice(dragOverItem.current, 0, draggedItem);
      onChange(newImages);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleReplace = (index: number, file: File) => {
    const newImages = [...localImages];
    newImages[index] = file;
    onChange(newImages);
  };

  const getSrc = (image: string | File) => {
    if (typeof image === 'string') return image;
    return previews.get(image) || '';
  }

  return (
    <div className={aspectRatio === "video" ? "grid grid-cols-1 gap-4" : "grid grid-cols-3 gap-4"}>
      {localImages.length < maxImages && (
        <div
          className={`${aspectRatio === "video" ? "aspect-video w-full" : "aspect-square"} border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-center p-4 cursor-pointer relative`}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground font-medium">Upload Image</span>
          <span className="text-xs text-muted-foreground mt-1">Drag & Drop or Click</span>
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            multiple={maxImages > 1}
            disabled={disabled}
          />
        </div>
      )}

      {localImages.map((image, index) => {
        const src = getSrc(image);
        if (!src) return null;
        return (
          <div
            key={typeof image === 'string' ? image : (image.name + '-' + image.size)}
            className={`${aspectRatio === "video" ? "aspect-video w-full" : "aspect-square"} relative group rounded-lg overflow-hidden border bg-white`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <Image
              src={src}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
              <div className="relative">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs w-24 pointer-events-auto"
                  disabled={disabled}
                >
                  Replace
                </Button>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplace(index, file);
                  }}
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 text-xs w-24"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
            {/* Drag Handle Indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 pointer-events-none">
              <GripVertical className="h-4 w-4 text-white drop-shadow-md" />
            </div>
          </div>
        )
      })}
    </div>
  );
}
