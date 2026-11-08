"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RotateCcw, RotateCw, ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "@/lib/crop-image";

type ImageCropDialogProps = {
  imageSrc: string | null;
  fileName: string;
  mimeType?: string;
  onClose: () => void;
  onApply: (file: File) => void;
};

export function ImageCropDialog({ imageSrc, fileName, mimeType, onClose, onApply }: ImageCropDialogProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Reset controls each time a new image is opened for editing
  React.useEffect(() => {
    if (imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    }
  }, [imageSrc]);

  const handleCropComplete = React.useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, rotation, fileName, mimeType);
      onApply(file);
      onClose();
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Crop & Rotate</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[320px] bg-muted rounded-md overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <ZoomIn className="h-3.5 w-3.5" /> Zoom
            </Label>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Rotate</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? "Applying..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
