import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { signalVolume } from "../data/platformOverview";

export function SignalVolumeChart() {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-navy-ink">
          Signal Volume — 7 days
        </h2>
        <p className="mt-1 text-[12.5px] text-slate-body">
          Thousands of signals per day, all apps
        </p>
      </div>

      <div className="min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={signalVolume}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B3F91" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#1B3F91" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#E6E9F0"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "Inter" }}
              dy={8}
            />
            <YAxis
              domain={[0, 1400]}
              ticks={[0, 350, 700, 1050, 1400]}
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
              labelStyle={{ color: "#142447", fontWeight: 600 }}
              formatter={(value: number) => [`${value}`, "Signals (k)"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1B3F91"
              strokeWidth={2.25}
              fill="url(#signalFill)"
              activeDot={{ r: 4, fill: "#1B3F91", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
