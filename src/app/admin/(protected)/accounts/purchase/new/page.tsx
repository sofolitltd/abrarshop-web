import { getProducts } from "@/lib/data";
import { getParties } from "@/lib/accounts-data";
import { PurchaseForm } from "@/components/admin/accounts/purchase-form";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const [{ products }, suppliers] = await Promise.all([
    getProducts({ limit: 1000 }),
    getParties("payable"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black font-headline uppercase tracking-tight">নতুন ক্রয়</h1>
        <p className="text-zinc-500 text-sm">পণ্য যুক্ত করলে স্টক বেড়ে যাবে এবং ক্রয়মূল্য আপডেট হবে।</p>
      </div>
      <PurchaseForm products={products} suppliers={suppliers} />
    </div>
  );
}
