"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RegistryChart({ data }: { data: { club: string; count: number }[] }) {
  return (
    <div role="img" aria-label={"To'garaklar bo'yicha taqsimot: " + data.map((d) => `${d.club} — ${d.count}`).join(", ")} style={{ height: Math.max(220, data.length * 48) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="club" width={130} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v} ta o'quvchi`, ""]} />
          <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
