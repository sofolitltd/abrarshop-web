"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type BarcodeDisplayProps = {
    value: string;
    productName?: string;
    className?: string;
    width?: number;
    height?: number;
};

/** Renders an EAN-13 barcode as an SVG for a given value, label and preview. */
export function BarcodeDisplay({ value, productName, className, width = 2, height = 60 }: BarcodeDisplayProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !value) return;
        try {
            JsBarcode(svgRef.current, value, {
                format: "EAN13",
                width,
                height,
                displayValue: true,
                fontSize: 14,
                margin: 8,
            });
        } catch {
            // Fall back to CODE128 for values that aren't valid EAN-13 (e.g. legacy/custom codes)
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    width,
                    height,
                    displayValue: true,
                    fontSize: 14,
                    margin: 8,
                });
            } catch {
                // ignore unrenderable value
            }
        }
    }, [value, width, height]);

    if (!value) return null;

    return (
        <div className={className}>
            {productName && <p className="text-xs font-medium text-center mb-1 truncate">{productName}</p>}
            <svg ref={svgRef} className="w-full" />
        </div>
    );
}
