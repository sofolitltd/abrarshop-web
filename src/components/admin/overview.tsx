"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

export function Overview({ data }: { data: any[] }) {
    // Fill missing days in the last 7 days if needed
    const filledData = [...data];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filledData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }} barSize={32}>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }}
                    fontFamily="inherit"
                    fontWeight="bold"
                />
                <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value}`}
                    fontFamily="inherit"
                    fontWeight="bold"
                />
                <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-black text-white p-3 text-[10px] font-black uppercase tracking-widest border-0 rounded-none shadow-xl">
                                    <p className="mb-1">{new Date(payload[0].payload.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                                    <p className="text-orange-500">Revenue: Tk {payload[0].value}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[0, 0, 0, 0]}
                    className="fill-black"
                >
                    {filledData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            className="hover:fill-orange-600 transition-colors cursor-pointer"
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
