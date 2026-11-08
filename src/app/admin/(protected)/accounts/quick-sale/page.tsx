import { getRecentLocalCustomers } from "@/lib/data";
import { QuickSaleScreen } from "@/components/admin/accounts/quick-sale-screen";

export const dynamic = "force-dynamic";

export default async function QuickSalePage() {
  const recentCustomers = await getRecentLocalCustomers();

  return <QuickSaleScreen recentCustomers={recentCustomers} />;
}
