import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PerformanceDataPoint {
    month: string;
    investedIdr: number;
    payoutsIdr: number;
    cumulativeIdr: number;
}

interface PerformanceBarChartProps {
    data: PerformanceDataPoint[];
    height?: number;
}

export default function PerformanceBarChart({
    data,
    height = 300,
}: PerformanceBarChartProps) {
    const formatCurrency = (idr: number) => {
        return `Rp ${idr.toLocaleString('id-ID')}`;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
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
                <Bar
                    dataKey="investedIdr"
                    fill="#EF4444"
                    name="Invested"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="payoutsIdr"
                    fill="#10B981"
                    name="Payouts"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
