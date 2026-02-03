"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import {
  enhanceProductDescription,
  type EnhanceProductDescriptionOutput,
} from "@/ai/flows/enhance-product-description";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type DescriptionEnhancerProps = {
  productName: string;
  currentDescription: string;
  onApply: (data: { description: string; keywords: string[] }) => void;
};

export function DescriptionEnhancer({
  productName,
  currentDescription,
  onApply,
}: DescriptionEnhancerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnhanceProductDescriptionOutput | null>(
    null
  );
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!productName || !currentDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a product name and description first.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await enhanceProductDescription({
        productName,
        currentDescription,
      });
      setResult(res);
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description:
          "Could not enhance the description at this time. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply({
        description: result.enhancedDescription,
        keywords: result.keywords,
      });
      setResult(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleEnhance}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Enhance with AI
      </Button>

      <Dialog open={!!result} onOpenChange={() => setResult(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Enhanced Description</DialogTitle>
            <DialogDescription>
              Review the AI-generated description and keywords. You can apply
              them to your product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Enhanced Description</h4>
              <div className="rounded-md border bg-muted p-4 text-sm">
                {result?.enhancedDescription}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Suggested Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result?.keywords.map((keyword: string) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResult(null)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
