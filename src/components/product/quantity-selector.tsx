"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
    quantity: number;
    setQuantity: (quantity: number) => void;
    stock: number;
};

export function QuantitySelector({ quantity, setQuantity, stock }: QuantitySelectorProps) {

    const increment = () => {
        if (quantity < stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        if (value > stock) {
            value = stock;
        }
        setQuantity(value);
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={decrement} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                type="number"
                className="h-9 w-16 text-center"
                value={quantity}
                onChange={handleChange}
                min="1"
                max={stock}
            />
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={increment} disabled={quantity >= stock}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
