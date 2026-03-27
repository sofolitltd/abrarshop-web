import { seedInitialAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SeedPage() {
  const result = await seedInitialAdmin();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin Seeding Status</h1>
      <div className={`p-4 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        {result.message}
      </div>
      <Button asChild>
        <Link href="/admin/login">Go to Login</Link>
      </Button>
    </div>
  );
}
