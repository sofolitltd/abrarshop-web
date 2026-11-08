import JsBarcode from "jsbarcode";

type BarcodeRenderOptions = {
    width?: number;
    height?: number;
    fontSize?: number;
    margin?: number;
};

/** Renders a barcode value to a standalone SVG markup string. Client-only (uses `document`). */
export function renderBarcodeSvgMarkup(value: string, options: BarcodeRenderOptions = {}): string {
    const { width = 1.4, height = 40, fontSize = 10, margin = 4 } = options;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    try {
        JsBarcode(svg, value, { format: "EAN13", width, height, fontSize, margin, displayValue: true });
    } catch {
        try {
            JsBarcode(svg, value, { format: "CODE128", width, height, fontSize, margin, displayValue: true });
        } catch {
            return "";
        }
    }
    return svg.outerHTML;
}
