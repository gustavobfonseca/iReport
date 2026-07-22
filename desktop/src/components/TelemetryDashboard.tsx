import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Zap, Activity, Thermometer } from "lucide-react";
import { ReactNode } from "react";

export interface TelemetryPoint {
  time: string;
  voltage: number;
  amperage: number;
  temperature: number;
}

interface TelemetryDashboardProps {
  data: TelemetryPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
  color: string;
  decimals?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
  color,
  decimals = 0,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b] border border-[#27272a] px-3 py-2 rounded-lg shadow-xl">
        <p className="text-text-muted font-mono text-[10px] mb-1">{label}</p>
        <span className="font-mono text-xs font-black" style={{ color }}>
          {payload[0].value.toFixed(decimals)} {unit}
        </span>
      </div>
    );
  }
  return null;
};

interface MetricPanelProps {
  icon: ReactNode;
  label: string;
  unit: string;
  color: string;
  dataKey: keyof TelemetryPoint;
  data: TelemetryPoint[];
  decimals?: number;
  withZeroLine?: boolean;
}

const MetricPanel = ({
  icon,
  label,
  unit,
  color,
  dataKey,
  data,
  decimals = 0,
  withZeroLine = false,
}: MetricPanelProps) => {
  const values = data.map((d) => d[dataKey] as number);
  const current = values[values.length - 1] ?? 0;
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const gradientId = `gradient-${String(dataKey)}`;

  return (
    <div className="bg-surface border border-border-strong rounded-2xl p-5 shadow-lg flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted">
          {icon} {label}
        </span>
        <div className="flex gap-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
              Mín
            </span>
            <span className="text-[10px] font-mono font-bold text-text-secondary">
              {min.toFixed(decimals)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
              Máx
            </span>
            <span className="text-[10px] font-mono font-bold text-text-secondary">
              {max.toFixed(decimals)}
            </span>
          </div>
        </div>
      </div>

      <span className="text-2xl font-mono font-black mb-2" style={{ color }}>
        {current.toFixed(decimals)}{" "}
        <span className="text-xs text-text-muted font-bold">{unit}</span>
      </span>

      <div className="h-24 w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            syncId="telemetry"
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="time"
              stroke="#71717a"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              minTickGap={30}
            />
            <YAxis
              stroke="#71717a"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={34}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => v.toFixed(decimals === 0 ? 0 : 1)}
            />
            {withZeroLine && (
              <ReferenceLine y={0} stroke="#71717a" strokeDasharray="3 3" strokeOpacity={0.4} />
            )}
            <Tooltip content={<CustomTooltip unit={unit} color={color} decimals={decimals} />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TelemetryDashboard = ({ data }: TelemetryDashboardProps) => {
  return (
    <div className="w-full mb-8">
      <span className="text-sm font-sans font-black uppercase tracking-widest text-text-muted mb-4 block">
        Dinâmica de Energia e Térmica
      </span>
      <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-4">
        <MetricPanel
          icon={<Zap className="w-3 h-3" />}
          label="Voltagem"
          unit="mV"
          color="#22c55e"
          dataKey="voltage"
          data={data}
        />
        <MetricPanel
          icon={<Activity className="w-3 h-3" />}
          label="Corrente"
          unit="mA"
          color="#3b82f6"
          dataKey="amperage"
          data={data}
          withZeroLine
        />
        <MetricPanel
          icon={<Thermometer className="w-3 h-3" />}
          label="Temperatura"
          unit="°C"
          color="#f59e0b"
          dataKey="temperature"
          data={data}
          decimals={1}
        />
      </div>
    </div>
  );
};
