"use client";

import * as React from "react";
import { useState } from "react";
import { Check, Search, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export const BD_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura",
  "Brahmanbaria", "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur",
  "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah",
  "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
  "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur",
  "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj",
  "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
  "Sylhet", "Tangail", "Thakurgaon"
].sort();

interface DistrictSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const DistrictSelect = React.forwardRef<HTMLButtonElement, DistrictSelectProps>(
  ({ value, onChange, className, placeholder = "Select District" }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredDistricts = BD_DISTRICTS.filter((district) =>
      district.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full h-10 rounded-none border-zinc-200 justify-between font-normal", !value && "text-zinc-400", className)}
          >
            {value || placeholder}
            <Truck className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 border-zinc-200 rounded-none w-[var(--radix-popover-trigger-width)] min-w-[200px] z-[999]" 
          align="start"
        >
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search district..."
              className="flex h-8 w-full rounded-none border-none bg-transparent py-3 text-sm outline-none focus-visible:ring-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-1">
              {filteredDistricts.length === 0 && (
                <div className="py-6 text-center text-sm text-zinc-500 uppercase font-black tracking-tight">
                  No district found.
                </div>
              )}
              {filteredDistricts.map((district) => (
                <div
                  key={district}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center px-4 py-2.5 text-sm font-medium outline-none hover:bg-zinc-100",
                    value === district ? "bg-zinc-50 text-black" : "text-zinc-600"
                  )}
                  onClick={() => {
                    onChange(district);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {district}
                  {value === district && <Check className="ml-auto h-3 w-3 text-[#ff5a00]" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }
);

DistrictSelect.displayName = "DistrictSelect";
