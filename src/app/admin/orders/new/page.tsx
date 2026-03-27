import { POSSystem } from "@/components/admin/pos-system";

export const metadata = {
  title: "POS System | Abrar Shop",
  description: "Enterprise Point of Sale for local in-shop orders.",
};

export default function NewOrderPage() {
  return (
    <div className="container py-8 max-w-[1600px]">
      <POSSystem />
    </div>
  );
}
