import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Deliberately outside the (protected) group's Sidebar/SidebarInset layout —
// Quick Sale is a focused, full-screen mobile screen and shouldn't show the
// main admin chrome. It still requires the same admin session as every other
// admin page.
export default async function QuickSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("admin_session");

  if (!session) {
    redirect("/admin/login");
  }

  return <div className="min-h-screen bg-zinc-50/50">{children}</div>;
}
