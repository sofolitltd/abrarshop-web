import Link from "next/link";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function TopBar() {
    return (
        // hide on sm 
        <div className="hidden sm:block w-full bg-transparent text-zinc-500 text-[11px] font-medium tracking-wider uppercase border-b border-zinc-200">
            <div className="container flex items-center justify-between h-9 px-4">
                {/* Left Side: Quick Order & WhatsApp */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer">
                        <Phone className="h-3 w-3" />
                        <span>Quick Order: 01725877772</span>
                    </div>
                    <a
                        href="https://wa.me/8801725877772"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-black transition-colors"
                    >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                    </a>
                </div>

                {/* Right Side: Track Order */}
                <div className="flex items-center gap-4">
                    <Link href="/track-order" className="hover:text-black transition-colors">
                        Track Order
                    </Link>
                    <div className="w-px h-4 bg-zinc-300 hidden sm:block"></div>
                    <Link href="/contact" className="hover:text-black transition-colors hidden sm:block">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
