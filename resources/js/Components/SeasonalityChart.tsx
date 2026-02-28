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

interface SeasonalityChartProps {
    data: {
        month: string;
        yield: number;
    }[];
    height?: number;
}

export default function SeasonalityChart({ data, height = 300 }: SeasonalityChartProps) {
    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const chartData = monthNames.map((month) => {
        const monthData = data.find((d) => d.month === month);
        return {
            month,
            yield: monthData ? monthData.yield : 0,
        };
    });

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                    formatter={(value) => [`${value} tons`, 'Harvest Yield']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                    }}
                />
                <Legend />
                <Bar
                    dataKey="yield"
                    fill="#4F46E5"
                    name="Harvest Yield (tons)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
