"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Minus, Plus } from "lucide-react";
import { renderBarcodeSvgMarkup } from "@/lib/render-barcode-svg";

type BulkBarcodeProduct = {
    id: string;
    name: string;
    barcode: string;
};

type BulkBarcodePrintDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: BulkBarcodeProduct[];
};

// A4 sheet, 5 labels per row, sized to stay easily scannable while small enough to cut and stick.
const COLUMNS = 5;

/** Dialog to print a sheet of barcode labels (with a configurable quantity per product) on one A4 page. */
export function BulkBarcodePrintDialog({ open, onOpenChange, products }: BulkBarcodePrintDialogProps) {
    // Remounted by the caller (via a `key` tied to the open state) each time the dialog
    // opens, so this lazy initializer always reflects the current product selection.
    const [quantities, setQuantities] = useState<Record<string, number>>(() =>
        Object.fromEntries(products.map((p) => [p.id, 1]))
    );

    const totalLabels = products.reduce((sum, p) => sum + (quantities[p.id] || 0), 0);

    function setQuantity(id: string, value: number) {
        setQuantities((prev) => ({ ...prev, [id]: Math.max(0, Math.min(200, value)) }));
    }

    function handlePrint() {
        const svgCache = new Map<string, string>();
        const getSvg = (barcode: string) => {
            if (!svgCache.has(barcode)) {
                svgCache.set(barcode, renderBarcodeSvgMarkup(barcode));
            }
            return svgCache.get(barcode) || "";
        };

        const cells: string[] = [];
        for (const product of products) {
            const qty = quantities[product.id] || 0;
            const svg = getSvg(product.barcode);
            if (!svg) continue;
            for (let i = 0; i < qty; i++) {
                cells.push(`
                    <div class="cell">
                        <p>${escapeHtml(product.name)}</p>
                        ${svg}
                    </div>
                `);
            }
        }

        if (cells.length === 0) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Barcode Labels</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        * { box-sizing: border-box; }
                        body { margin: 0; font-family: sans-serif; }
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(${COLUMNS}, 1fr);
                            gap: 5mm 3mm;
                        }
                        .cell {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            break-inside: avoid;
                            page-break-inside: avoid;
                            border: 1px dashed #ccc;
                            padding: 2mm;
                        }
                        .cell p {
                            margin: 0 0 1mm;
                            font-size: 8px;
                            font-weight: 600;
                            text-align: center;
                            width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .cell svg { width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    <div class="grid">
                        ${cells.join("")}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.print();
            }
        }, 300);

        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        Print Barcode Labels
                    </DialogTitle>
                    <DialogDescription>
                        Set how many labels each product needs. They&apos;ll be laid out {COLUMNS} per row on an A4 sheet, ready to cut and stick.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                    {products.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Select products with a barcode to print labels for them.
                        </p>
                    )}
                    {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 border rounded-md p-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" title={product.name}>{product.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setQuantity(product.id, (quantities[product.id] || 0) - 1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                    type="number"
                                    min={0}
                                    max={200}
                                    value={quantities[product.id] ?? 1}
                                    onChange={(e) => setQuantity(product.id, Number(e.target.value) || 0)}
                                    className="h-7 w-14 text-center px-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setQuantity(product.id, (quantities[product.id] || 0) + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex items-center sm:justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{totalLabels} label{totalLabels !== 1 ? "s" : ""} total</span>
                    <Button type="button" onClick={handlePrint} disabled={totalLabels === 0}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
