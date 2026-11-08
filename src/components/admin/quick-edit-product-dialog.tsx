"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/types";
import { quickUpdateProduct, uploadImage } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./image-uploader";
import { Progress } from "@/components/ui/progress";

type QuickEditProductDialogProps = {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
};

export function QuickEditProductDialog({ product, onOpenChange }: QuickEditProductDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const [price, setPrice] = React.useState("0");
  const [originalPrice, setOriginalPrice] = React.useState("");
  const [buyPrice, setBuyPrice] = React.useState("");
  const [stock, setStock] = React.useState("0");
  const [discount, setDiscount] = React.useState("0");
  const [status, setStatus] = React.useState<"draft" | "published">("published");
  const [visibleOnline, setVisibleOnline] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isTrending, setIsTrending] = React.useState(false);
  const [isBestSelling, setIsBestSelling] = React.useState(false);
  const [images, setImages] = React.useState<(string | File)[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (product) {
      setPrice(String(product.price ?? 0));
      setOriginalPrice(product.originalPrice != null ? String(product.originalPrice) : "");
      setBuyPrice(product.buyPrice != null ? String(product.buyPrice) : "");
      setStock(String(product.stock ?? 0));
      setDiscount(String(product.discount ?? 0));
      setStatus(product.status === "draft" ? "draft" : "published");
      setVisibleOnline(product.visibleOnline !== false);
      setIsFeatured(!!product.isFeatured);
      setIsTrending(!!product.isTrending);
      setIsBestSelling(!!product.isBestSelling);
      setImages(product.images || []);
      setUploadProgress(null);
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    startTransition(async () => {
      // Upload any newly added images (already compressed client-side) first,
      // keeping already-uploaded URLs untouched.
      const filesToUpload = images.filter((img): img is File => img instanceof File);
      const uploadedUrls = new Map<File, string>();

      if (filesToUpload.length > 0) {
        setUploadProgress(0);
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const formData = new FormData();
          formData.append("file", file);
          const result = await uploadImage(formData);

          if (!result.success || !result.url) {
            toast({
              title: "Upload Failed",
              description: result.message || `Could not upload image: ${file.name}.`,
              variant: "destructive",
            });
            setUploadProgress(null);
            return;
          }
          uploadedUrls.set(file, result.url);
          setUploadProgress(((i + 1) / filesToUpload.length) * 100);
        }
      }

      const finalImages = images.map((img) =>
        img instanceof File ? uploadedUrls.get(img) || "" : img
      ).filter(Boolean) as string[];

      const result = await quickUpdateProduct(product.id, {
        price,
        originalPrice: originalPrice === "" ? null : originalPrice,
        buyPrice: buyPrice === "" ? null : buyPrice,
        stock,
        discount,
        status,
        visibleOnline,
        isFeatured,
        isTrending,
        isBestSelling,
        images: finalImages,
      });

      setUploadProgress(null);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: result.message,
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-base" title={product?.name}>
            Quick Edit
          </DialogTitle>
          {product?.name && (
            <p className="text-sm text-muted-foreground truncate" title={product.name}>
              {product.name}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Images</Label>
          <ImageUploader
            value={images}
            onChange={setImages}
            disabled={isPending}
            maxImages={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="qe-buy-price">Buy Price</Label>
            <Input
              id="qe-buy-price"
              type="number"
              inputMode="decimal"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qe-price">Special Price</Label>
            <Input
              id="qe-price"
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qe-original-price">Regular Price</Label>
            <Input
              id="qe-original-price"
              type="number"
              inputMode="decimal"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qe-discount">Discount (%)</Label>
            <Input
              id="qe-discount"
              type="number"
              inputMode="decimal"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qe-stock">Stock</Label>
            <Input
              id="qe-stock"
              type="number"
              inputMode="numeric"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qe-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
              <SelectTrigger id="qe-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Switch id="qe-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label htmlFor="qe-featured">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="qe-trending" checked={isTrending} onCheckedChange={setIsTrending} />
            <Label htmlFor="qe-trending">Trending</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="qe-bestselling" checked={isBestSelling} onCheckedChange={setIsBestSelling} />
            <Label htmlFor="qe-bestselling">Best Seller</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="qe-visible-online" checked={visibleOnline} onCheckedChange={setVisibleOnline} />
            <Label htmlFor="qe-visible-online">Visible Online</Label>
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="space-y-1.5">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">Uploading images ({uploadProgress.toFixed(0)}%)...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
