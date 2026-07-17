import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ingestionLegend,
  signalIngestionByApp,
} from "../data/householdIntelligence";

export function SignalIngestionChart() {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-navy-ink">
            Signal Ingestion Today — by App
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-body">
            Signals per hour, all connected apps
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-4">
          {ingestionLegend.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-1.5 text-[12px] text-slate-body"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="h-[260px] min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={signalIngestionByApp}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="smartshopFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B3F91" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#1B3F91" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="recipeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F9D63" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#1F9D63" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fitnessFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B5EA7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#7B5EA7" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#E6E9F0"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              ticks={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]}
              tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "Inter" }}
              dy={8}
            />
            <YAxis
              domain={[0, 1200]}
              ticks={[0, 300, 600, 900, 1200]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "DM Mono" }}
              width={42}
            />
            <Tooltip
              cursor={{ stroke: "#1B3F91", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E6E9F0",
                boxShadow: "0 4px 12px rgba(20,36,71,0.08)",
                fontSize: 12,
                fontFamily: "Inter",
              }}
            />
            <Area
              type="monotone"
              dataKey="smartshop"
              name="SmartShop"
              stroke="#1B3F91"
              strokeWidth={2}
              fill="url(#smartshopFill)"
              activeDot={{ r: 3.5 }}
            />
            <Area
              type="monotone"
              dataKey="recipe"
              name="Recipe AI"
              stroke="#1F9D63"
              strokeWidth={2}
              fill="url(#recipeFill)"
              activeDot={{ r: 3.5 }}
            />
            <Area
              type="monotone"
              dataKey="fitness"
              name="Fitness AI"
              stroke="#7B5EA7"
              strokeWidth={2}
              fill="url(#fitnessFill)"
              activeDot={{ r: 3.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
