import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SubjectPerformance } from "@/types";

interface Props {
  data: SubjectPerformance[];
}

export function SubjectPerformanceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
        />
        <YAxis
          type="category"
          dataKey="subject"
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)" }}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
            fontSize: "0.8rem",
          }}
        />
        <Bar
          dataKey="averageScore"
          fill="var(--color-chart-1)"
          radius={[0, 6, 6, 0]}
          name="Avg score"
          barSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
