
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CartPageContent } from "@/components/cart/cart-page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shopping Cart | Abrar Shop",
    description: "View and manage items in your shopping cart before checkout.",
};

export default function CartPage() {
    return (
        <div className="container py-6">
            <div className="mb-4">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Shopping Cart", href: "/cart" },
                    ]}
                />
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tighter mb-10">
                Shopping Cart
            </h1>

            <CartPageContent />
        </div>
    );
}
