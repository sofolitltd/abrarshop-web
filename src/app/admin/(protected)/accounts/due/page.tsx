import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getParties } from "@/lib/accounts-data";
import { PartyList } from "@/components/admin/accounts/party-list";

export const dynamic = "force-dynamic";

export default async function DuePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const [payableParties, receivableParties] = await Promise.all([
    getParties("payable"),
    getParties("receivable"),
  ]);

  const totalPayable = payableParties.reduce((s, p) => s + Number(p.currentBalance), 0);
  const totalReceivable = receivableParties.reduce((s, p) => s + Number(p.currentBalance), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black font-headline uppercase tracking-tight">দেনা-পাওনা</h1>
        <p className="text-zinc-500 text-sm">সাপ্লায়ারদের দেনা (আমরা দিব) এবং কাস্টমারদের পাওনা (তারা দিবে) এর হিসাব।</p>
      </div>

      <Tabs defaultValue={tab === "receivable" ? "receivable" : "payable"}>
        <TabsList className="rounded-none">
          <TabsTrigger value="payable" className="rounded-none">দেনা (৳{Math.round(totalPayable).toLocaleString()})</TabsTrigger>
          <TabsTrigger value="receivable" className="rounded-none">পাওনা (৳{Math.round(totalReceivable).toLocaleString()})</TabsTrigger>
        </TabsList>

        <TabsContent value="payable" className="mt-4">
          <PartyList parties={payableParties} type="payable" />
        </TabsContent>
        <TabsContent value="receivable" className="mt-4">
          <PartyList parties={receivableParties} type="receivable" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
