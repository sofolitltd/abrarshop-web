"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScanBarcode } from "lucide-react";
import type { Html5QrcodeScanner } from "html5-qrcode";

type BarcodeScannerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (value: string) => void;
    title?: string;
    description?: string;
};

/** Dialog that opens the device camera and scans a barcode using html5-qrcode. */
export function BarcodeScannerDialog({ open, onOpenChange, onScan, title = "Scan Barcode", description = "Point the camera at a product's barcode." }: BarcodeScannerDialogProps) {
    const regionId = useId().replace(/:/g, "-");
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let isMounted = true;
        setError(null);

        import("html5-qrcode").then(({ Html5QrcodeScanner, Html5QrcodeSupportedFormats }) => {
            if (!isMounted) return;

            const scanner = new Html5QrcodeScanner(
                regionId,
                {
                    fps: 10,
                    qrbox: { width: 260, height: 160 },
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                    ],
                    rememberLastUsedCamera: true,
                },
                false
            );
            scannerRef.current = scanner;

            scanner.render(
                (decodedText: string) => {
                    onScan(decodedText.trim());
                    onOpenChange(false);
                },
                () => {
                    // Ignore per-frame "not found" errors; they fire continuously while scanning.
                }
            );
        }).catch(() => {
            if (isMounted) setError("Could not load the barcode scanner.");
        });

        return () => {
            isMounted = false;
            scannerRef.current?.clear().catch(() => { });
            scannerRef.current = null;
        };
    }, [open, regionId, onScan, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : (
                    <div id={regionId} className="w-full [&_video]:rounded-md" />
                )}
                {/*
                  html5-qrcode injects its own camera-select dropdown and start/stop/permission
                  buttons directly into the DOM (not through React), using fixed global element
                  IDs. These overrides restyle that default, unstyled browser-chrome look into a
                  small, muted toolbar underneath the scan region instead of the dominant element.
                */}
                <style jsx global>{`
                #${regionId} {
                    border: 1px solid #e4e4e7 !important;
                    border-radius: 0 !important;
                    overflow: hidden;
                }
                #${regionId} .html5-qrcode-element {
                    font-family: inherit !important;
                }
                #${regionId} > div:last-child {
                    padding: 8px 10px !important;
                    background: #fafafa;
                    border-top: 1px solid #e4e4e7;
                }
                #html5-qrcode-select-camera {
                    border: 1px solid #e4e4e7 !important;
                    border-radius: 0 !important;
                    background: #fff !important;
                    font-size: 11px !important;
                    padding: 5px 6px !important;
                    color: #52525b !important;
                    max-width: 100%;
                }
                #html5-qrcode-button-camera-start,
                #html5-qrcode-button-camera-stop,
                #html5-qrcode-button-camera-permission,
                #html5-qrcode-button-file-selection {
                    border: none !important;
                    border-radius: 0 !important;
                    background: #18181b !important;
                    color: #fff !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.03em;
                    padding: 6px 12px !important;
                    margin: 4px 4px 0 0 !important;
                }
                #html5-qrcode-anchor-scan-type-change {
                    font-size: 10px !important;
                    color: #a1a1aa !important;
                    text-decoration: underline;
                }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
