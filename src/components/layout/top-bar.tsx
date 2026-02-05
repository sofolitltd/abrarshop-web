import Link from "next/link";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function TopBar() {
    return (
        <div className="w-full bg-zinc-900 text-zinc-300 text-[11px] font-medium tracking-wider uppercase border-b border-zinc-800">
            <div className="container flex items-center justify-between h-9 px-4">
                {/* Left Side: Quick Order & WhatsApp */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                        <Phone className="h-3 w-3" />
                        <span>Quick Order: 01725877772</span>
                    </div>
                    <a
                        href="https://wa.me/8801725877772"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-green-400 transition-colors"
                    >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                    </a>
                </div>

                {/* Right Side: Track Order */}
                <div className="flex items-center gap-4">
                    <Link href="/track-order" className="hover:text-white transition-colors">
                        Track Order
                    </Link>
                    <div className="w-px h-3 bg-zinc-700 hidden sm:block"></div>
                    <Link href="/contact" className="hover:text-white transition-colors hidden sm:block">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
