import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="max-w-lg text-center p-4">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">Thank You for Your Order!</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            Your order has been placed successfully. A confirmation email has been sent to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
