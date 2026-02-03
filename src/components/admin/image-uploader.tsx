"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type ImageUploaderProps = {
  value: (string | File)[];
  onChange: (value: (string | File)[]) => void;
  disabled?: boolean;
};

export function ImageUploader({ value, onChange, disabled = false }: ImageUploaderProps) {
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

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
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
  
  const getSrc = (image: string | File) => {
      if (typeof image === 'string') return image;
      return previews.get(image) || '';
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 min-h-[6.5rem]">
        {localImages.map((image, index) => {
            const src = getSrc(image);
            if (!src) return null;
            return (
          <div
            key={typeof image === 'string' ? image : (image.name + index)}
            className="relative group w-24 h-24 cursor-grab"
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <Image
              src={src}
              alt="Product image"
              fill
              className="object-cover rounded-md border pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <GripVertical className="h-8 w-8 text-white" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
              onClick={() => handleRemoveImage(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )})}
      </div>

      <div className="w-full border-2 border-dashed border-muted rounded-lg p-10 flex flex-col items-center justify-center text-center relative">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          <span className="font-semibold text-accent">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          multiple
          disabled={disabled}
        />
      </div>
    </div>
  );
}
