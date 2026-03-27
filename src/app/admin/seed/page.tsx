import { seedInitialAdmin, seedInitialSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SeedPage() {
  const result = await seedInitialAdmin();
  const settingsResult = await seedInitialSettings();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin Seeding Status</h1>
      <div className={`p-4 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        Staff: {result.message}
      </div>
      <div className={`p-4 border ${settingsResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        Settings: {settingsResult.message}
      </div>
      <Button asChild>
        <Link href="/admin/login">Go to Login</Link>
      </Button>
    </div>
  );
}
