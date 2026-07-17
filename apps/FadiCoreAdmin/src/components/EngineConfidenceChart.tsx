import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { engineConfidenceScores } from "../data/householdIntelligence";

export function EngineConfidenceChart() {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-navy-ink">
          Engine Confidence Scores
        </h2>
        <p className="mt-1 text-[12.5px] text-slate-body">
          Blue = actual · gray = target threshold
        </p>
      </div>

      <div className="min-h-[240px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={engineConfidenceScores}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            barCategoryGap="28%"
            barGap={2}
          >
            <CartesianGrid
              stroke="#E6E9F0"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="engine"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "Inter" }}
              dy={6}
            />
            <YAxis
              domain={[60, 100]}
              ticks={[60, 70, 80, 90, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "DM Mono" }}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "rgba(27, 63, 145, 0.04)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E6E9F0",
                boxShadow: "0 4px 12px rgba(20,36,71,0.08)",
                fontSize: 12,
                fontFamily: "Inter",
              }}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === "actual" ? "Actual" : "Target",
              ]}
            />
            <Bar
              dataKey="target"
              name="target"
              fill="#D7DCE8"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="actual"
              name="actual"
              fill="#6B8FD6"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
