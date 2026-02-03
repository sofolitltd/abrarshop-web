import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="lg:col-span-1">
           <CheckoutForm />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderSummary />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
