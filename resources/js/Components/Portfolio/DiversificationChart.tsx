import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DiversificationData } from '@/types';

interface Props {
    data: {
        by_fruit_type: DiversificationData[];
        by_farm: DiversificationData[];
        by_risk: DiversificationData[];
    };
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const RISK_COLORS: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
};

export default function DiversificationChart({ data }: Props) {
    const [activeTab, setActiveTab] = useState<'fruit_type' | 'farm' | 'risk'>('fruit_type');

    const getChartData = () => {
        switch (activeTab) {
            case 'fruit_type':
                return data.by_fruit_type.map((item, index) => ({
                    name: item.category,
                    value: item.value_cents,
                    count: item.count,
                    color: COLORS[index % COLORS.length],
                }));
            case 'farm':
                return data.by_farm.map((item, index) => ({
                    name: item.category,
                    value: item.value_cents,
                    count: item.count,
                    color: COLORS[index % COLORS.length],
                }));
            case 'risk':
                return data.by_risk.map((item) => ({
                    name: item.category,
                    value: item.value_cents,
                    count: item.count,
                    color: RISK_COLORS[item.category.toLowerCase()] || COLORS[0],
                }));
            default:
                return [];
        }
    };

    const chartData = getChartData();
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const formatCurrency = (cents: number) => {
        return 'RM ' + (cents / 100).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Portfolio Diversification
                    </h3>
                    <div className="flex gap-2">
                        {(['fruit_type', 'farm', 'risk'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    activeTab === tab
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab === 'fruit_type' ? 'Fruit Type' : tab === 'farm' ? 'Farm' : 'Risk'}
                            </button>
                        ))}
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No data available
                    </p>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [
                                        formatCurrency(Number(value)),
                                        'Value',
                                    ]}
                                />
                                <Legend
                                    formatter={(value, entry) => {
                                        const item = entry.payload as typeof chartData[0];
                                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                                        return `${value} (${percentage}%)`;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
