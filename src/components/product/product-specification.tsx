import type { Product } from "@/lib/types";

type ProductSpecificationProps = {
  product: Product;
};

// Dummy data generator based on product
const generateSpecifications = (product: Product) => {
    return [
        { label: 'Brand', value: product.brand },
        { label: 'Display', value: '15.7-inch FHD (1920 x 1080) IPS panel, 144Hz' },
        { label: 'Processor', value: '12th Gen Intel Core i7-12700H' },
        { label: 'Graphics', value: 'NVIDIA GeForce RTX 3060 Laptop GPU' },
        { label: 'Memory', value: '16GB DDR5-4800 RAM' },
        { label: 'Storage', value: '1TB PCIe NVMe M.2 SSD' },
        { label: 'Audio', value: '2 x 4W speakers with Smart Amp technology' },
        { label: 'Connection', value: 'Wi-Fi 6E, Bluetooth 5.2, Gigabit Ethernet, HDMI 2.1' },
        { label: 'Keyboard', value: 'Backlit Chiclet Keyboard, N-key rollover' },
        { label: 'Battery', value: '4-cell 90Whr lithium-ion battery' },
        { label: 'Dimensions', value: '15.7 x 11.1 x 1.0 inches' },
        { label: 'Weight', value: '6.28 pounds' },
    ];
}


export function ProductSpecification({ product }: ProductSpecificationProps) {
    const specifications = generateSpecifications(product);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {specifications.map(spec => (
                <div key={spec.label} className="grid grid-cols-2 items-baseline">
                    <p className="font-semibold text-muted-foreground">{spec.label}</p>
                    <p className="text-sm">{spec.value}</p>
                </div>
            ))}
        </div>
  );
}
