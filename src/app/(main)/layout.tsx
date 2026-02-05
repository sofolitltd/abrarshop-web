import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getCategories } from "@/lib/data";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
