"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Boxes,
  PackageX,
  PackageSearch,
  Wallet,
  Tag,
  TrendingUp,
  FileText,
} from "lucide-react";
import { getProductStatistics } from "@/lib/actions";

type Stats = {
  totalProducts: number;
  totalStock: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalRegularValue: number;
  potentialProfit: number;
  outOfStockCount: number;
  lowStockCount: number;
  draftCount: number;
  publishedCount: number;
};

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("en-US")}৳`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "warning";
}) {
  const toneClasses =
    tone === "positive"
      ? "text-green-600 bg-green-50"
      : tone === "warning"
      ? "text-amber-600 bg-amber-50"
      : "text-foreground bg-muted";

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${toneClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ProductStatisticsDialog() {
  const [open, setOpen] = React.useState(false);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !stats) {
      setIsLoading(true);
      setError(null);
      getProductStatistics().then((result) => {
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setError(result.message || "Failed to load statistics.");
        }
        setIsLoading(false);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="outline" onClick={() => handleOpenChange(true)} className="shrink-0">
        <BarChart3 className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Statistics</span>
        <span className="sm:hidden">Stats</span>
      </Button>

      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Statistics</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
        )}

        {!isLoading && error && (
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Boxes} label="Total Products" value={stats.totalProducts.toLocaleString("en-US")} />
              <StatCard icon={PackageSearch} label="Total Stock (units)" value={stats.totalStock.toLocaleString("en-US")} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <StatCard
                icon={Wallet}
                label="Stock Value — Buy Price (Capital)"
                value={formatMoney(stats.totalBuyValue)}
                hint="Total money tied up in current stock, at buy price"
              />
              <StatCard
                icon={Tag}
                label="Stock Value — Special Price"
                value={formatMoney(stats.totalSellValue)}
                hint="Expected revenue if all current stock sells at special price"
              />
              <StatCard
                icon={Tag}
                label="Stock Value — Regular Price"
                value={formatMoney(stats.totalRegularValue)}
                hint="Value of current stock at regular (non-discounted) price"
              />
              <StatCard
                icon={TrendingUp}
                label="Potential Profit"
                value={formatMoney(stats.potentialProfit)}
                hint="Special price value minus buy price value"
                tone={stats.potentialProfit >= 0 ? "positive" : "warning"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={PackageX}
                label="Out of Stock"
                value={stats.outOfStockCount.toLocaleString("en-US")}
                tone={stats.outOfStockCount > 0 ? "warning" : "default"}
              />
              <StatCard
                icon={PackageX}
                label="Low Stock (≤5)"
                value={stats.lowStockCount.toLocaleString("en-US")}
                tone={stats.lowStockCount > 0 ? "warning" : "default"}
              />
              <StatCard icon={FileText} label="Published" value={stats.publishedCount.toLocaleString("en-US")} />
              <StatCard icon={FileText} label="Draft" value={stats.draftCount.toLocaleString("en-US")} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
