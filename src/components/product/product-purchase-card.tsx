"use client";

import React from "react";
import type { Product } from "@/lib/types";
import { QuantitySelector } from "./quantity-selector";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function ProductPurchaseCard({ product }: { product: Product }) {
    const [quantity, setQuantity] = React.useState(1);

    return (
        <div className="space-y-4">
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} stock={product.stock} />
            <div className="flex items-center gap-2">
                <AddToCartButton product={product} quantity={quantity} variant="buyNow" />
                <AddToCartButton product={product} quantity={quantity} variant="cart" />
            </div>
            <Separator />
             <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">To order directly, or for any questions:</p>
              <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" asChild>
                     <Link href="tel:01725877772">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Now
                     </Link>
                  </Button>
                   <Button variant="outline" asChild>
                      <Link href="https://wa.me/8801725877772" target="_blank">
                          <FaWhatsapp className="mr-2 h-5 w-5" />
                          WhatsApp
                      </Link>
                   </Button>
                   
              </div>
            </div>
        </div>
    )
}
