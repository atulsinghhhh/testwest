import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: { grade: string; averageScore: number; students: number }[];
}

export function GradePerformanceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="grade"
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
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
          radius={[6, 6, 0, 0]}
          name="Avg score"
          barSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
