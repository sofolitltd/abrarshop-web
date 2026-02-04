import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function ThankYouPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Checkout", href: "/checkout" },
            { name: "Success", href: "#" }
          ]}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full text-center p-6 border-zinc-200 rounded-none shadow-sm">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="mt-8 text-3xl font-bold font-headline uppercase tracking-tight">Order Confirmed!</CardTitle>
            <CardDescription className="mt-4 text-zinc-500 leading-relaxed">
              Your order has been placed successfully. We&apos;ll notify you once your package is on its way. Thank you for shopping with Abrar Shop!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button asChild className="rounded-none px-8 py-6 bg-black hover:bg-zinc-900 font-bold uppercase tracking-widest">
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none px-8 py-6 border-zinc-200 font-bold uppercase tracking-widest">
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Visit Shop
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
