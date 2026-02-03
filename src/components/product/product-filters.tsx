import { getCategories, getBrands } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export async function ProductFilters() {
    const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands()
    ]);

    return (
        <div className="space-y-6 sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {categories.slice(0, 10).map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox id={`cat-${category.id}`} />
                            <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.name}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Brands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {brands.slice(0, 10).map(brand => (
                        <div key={brand.id} className="flex items-center space-x-2">
                            <Checkbox id={`brand-${brand.id}`} />
                            <Label htmlFor={`brand-${brand.id}`} className="font-normal">{brand.name}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                    <Slider defaultValue={[0, 50000]} max={100000} step={1000} className="mb-4" />
                    <div className="flex items-center justify-between gap-4">
                        <Input placeholder="Min" type="number" />
                        <span className="text-muted-foreground">-</span>
                        <Input placeholder="Max" type="number" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
