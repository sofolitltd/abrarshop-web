"use client";

import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { BarcodeDisplay } from "./barcode-display";

type BarcodePrintDialogProps = {
    value: string;
    productName?: string;
    trigger: React.ReactNode;
};

/** Dialog that previews a product's barcode label and prints it in a dedicated window. */
export function BarcodePrintDialog({ value, productName, trigger }: BarcodePrintDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    function handlePrint() {
        const svg = containerRef.current?.querySelector("svg");
        if (!svg) return;

        const printWindow = window.open("", "_blank", "width=400,height=300");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Barcode Label</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        p { margin: 0 0 8px; font-size: 14px; font-weight: 600; text-align: center; }
                    </style>
                </head>
                <body>
                    ${productName ? `<p>${productName}</p>` : ""}
                    ${svg.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
        // Some browsers don't fire onload reliably for document.write; fall back.
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.print();
            }
        }, 300);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Product Barcode</DialogTitle>
                </DialogHeader>
                <div ref={containerRef} className="py-4">
                    <BarcodeDisplay value={value} productName={productName} />
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
