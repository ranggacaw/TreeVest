import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PerformanceDataPoint {
    month: string;
    investedCents: number;
    payoutsCents: number;
    cumulativeCents: number;
}

interface ReturnsTrendChartProps {
    data: PerformanceDataPoint[];
    height?: number;
}

export default function ReturnsTrendChart({ data, height = 300 }: ReturnsTrendChartProps) {
    const formatCurrency = (cents: number) => {
        return `Rp ${(cents / 100).toFixed(2)}`;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                    formatter={(value: number | undefined) => value ? formatCurrency(value) : ''}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="cumulativeCents"
                    stroke="#6366F1"
                    strokeWidth={2}
                    name="Cumulative Returns"
                    dot={{ fill: '#6366F1', r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
