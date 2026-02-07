import Link from "next/link";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-black text-zinc-300 pt-16 pb-8 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold font-headline tracking-tighter text-white">
                ABRAR<span className="text-orange-500">{" "}SHOP</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">
              Your one-stop destination for the latest trends and high-quality products. We bring the best of the market directly to your doorstep.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#1877F2] transition-all group">
                <FaFacebookF className="h-4 w-4 text-zinc-400 group-hover:text-white" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#E4405F] transition-all group">
                <FaInstagram className="h-5 w-5 text-zinc-400 group-hover:text-white" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#FF0000] transition-all group">
                <FaYoutube className="h-5 w-5 text-zinc-400 group-hover:text-white" />
              </Link>
              <Link href="https://wa.me/8801725877772" target="_blank" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-[#25D366] transition-all group">
                <FaWhatsapp className="h-5 w-5 text-zinc-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/product" className="hover:text-orange-500 transition-colors">All Products</Link></li>
              <li><Link href="/brand" className="hover:text-orange-500 transition-colors">Shop by Brands</Link></li>
              <li><Link href="/category" className="hover:text-orange-500 transition-colors">Shop by Categories</Link></li>
              <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-zinc-400">Gaibandha, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                <a href="tel:01725877772" className="text-zinc-400 hover:text-white transition-colors">01725-877772</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                <a href="mailto:support@abrarshop.com.bd" className="text-zinc-400 hover:text-white transition-colors">support@abrarshop.com.bd</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Newsletter</h4>
            <p className="text-sm text-zinc-400">Subscribe to get special offers and once-in-a-lifetime deals.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                className="bg-zinc-900 border-zinc-800 text-white rounded-none focus-visible:ring-orange-500"
              />
              <Button size="icon" className="bg-orange-600 hover:bg-orange-700 rounded-none shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} ABRAR SHOP. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

