"use client";

import { cn } from "@/lib/utils";
import { FaFacebookF, FaFacebookMessenger, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { CopyButton } from "@/components/ui/copy-button";
import { useEffect, useState } from "react";

interface ProductShareProps {
    productName: string;
    className?: string;
}

export function ProductShare({ productName, className }: ProductShareProps) {
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const shareLinks = [
        {
            name: "Facebook",
            icon: <FaFacebookF className="h-3.5 w-3.5" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
            color: "bg-[#1877F2] hover:bg-[#166fe5]",
        },
        {
            name: "Messenger",
            icon: <FaFacebookMessenger className="h-3.5 w-3.5" />,
            href: `fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`,
            color: "bg-[#0084FF] hover:bg-[#0073e6]",
        },
        {
            name: "WhatsApp",
            icon: <FaWhatsapp className="h-4 w-4" />,
            href: `https://wa.me/?text=${encodeURIComponent(`Check out this ${productName}: ${currentUrl}`)}`,
            color: "bg-[#25D366] hover:bg-[#20bd5a]",
        },
        {
            name: "Gmail",
            icon: <FaEnvelope className="h-3.5 w-3.5" />,
            href: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(`I thought you might interest in this product: ${currentUrl}`)}`,
            color: "bg-[#EA4335] hover:bg-[#d93025]",
        },
    ];

    return (
        <div className={cn("space-y-3", className)}>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Share This Product</p>
            <div className="flex flex-wrap items-center gap-2">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex h-8 w-8 items-center justify-center text-white transition-all hover:scale-110",
                            link.color
                        )}
                        title={`Share on ${link.name}`}
                    >
                        {link.icon}
                    </a>
                ))}
                <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-all cursor-pointer">
                    <CopyButton value={currentUrl} className="text-zinc-600 hover:text-black" />
                </div>
            </div>
        </div>
    );
}
