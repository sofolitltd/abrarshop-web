import { getRecentLocalCustomers } from "@/lib/data";
import { getParties } from "@/lib/accounts-data";
import { QuickSaleScreen } from "@/components/admin/accounts/quick-sale-screen";

export const dynamic = "force-dynamic";

export default async function QuickSalePage() {
  const [recentCustomers, allCustomers] = await Promise.all([
    getRecentLocalCustomers(),
    getParties("receivable"),
  ]);

  return (
    <div className="p-3">
      <QuickSaleScreen recentCustomers={recentCustomers} allCustomers={allCustomers} />
    </div>
  );
}
