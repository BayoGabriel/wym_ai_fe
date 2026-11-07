import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type ReportShape = {
  conversations: { total: number; byChannel: { channel: string; count: number }[] };
  previous: { conversations: number; messages: number; leads: number; handoffs: number; appointments: number };
  messages: { total: number; daily: { date: string; count: number }[] };
  leads: { total: number; byStatus: { status: string; count: number }[]; byCategory: { category: string; count: number }[] };
  handoffs: { total: number; open: number; byStatus: { status: string; count: number }[] };
  appointments: { total: number; byStatus: { status: string; count: number }[] };
};

const CHANNEL_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];

const tipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
};

export function VolumeChart({ data }: { data: { date: string; count: number }[] }) {
  const points = data.map((d) => ({ ...d, day: d.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <Tooltip contentStyle={tipStyle} />
        <Area type="monotone" dataKey="count" name="Messages" stroke="var(--chart-1)" strokeWidth={2} fill="url(#vol)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ChannelDonut({ data }: { data: { channel: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="channel"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

const STATUS_ORDER = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export function LeadFunnel({ data }: { data: { status: string; count: number }[] }) {
  const byStatus = new Map(data.map((d) => [d.status, d.count]));
  const points = STATUS_ORDER.map((s) => ({ status: s, count: byStatus.get(s) ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={points} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} width={84} />
        <Tooltip contentStyle={tipStyle} />
        <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} barSize={16}>
          {points.map((_, i) => (
            <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusBars({
  data,
  name,
}: {
  data: { status: string; count: number }[];
  name: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={44} />
        <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <Tooltip contentStyle={tipStyle} />
        <Bar dataKey="count" name={name} fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
