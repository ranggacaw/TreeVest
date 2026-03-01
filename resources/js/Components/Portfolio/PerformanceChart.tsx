import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PerformanceMetrics } from '@/types';

interface Props {
    performance: PerformanceMetrics;
    formatCurrency: (cents: number) => string;
}

export default function PerformanceChart({ performance, formatCurrency }: Props) {
    const hasActualReturns = performance.investments.some(inv => inv.actual_return_cents > 0);

    const chartData = performance.investments.slice(0, 10).map(inv => ({
        name: inv.tree_identifier || `Inv #${inv.investment_id}`,
        Projected: inv.projected_return_cents / 100,
        Actual: inv.actual_return_cents / 100,
    }));

    const summaryText = `Total projected: ${formatCurrency(performance.projected_returns_cents)} | Total actual: ${formatCurrency(performance.actual_returns_cents)} | Difference: ${performance.difference_cents >= 0 ? '+' : ''}${formatCurrency(performance.difference_cents)} (${performance.percentage_gain_loss >= 0 ? '+' : ''}${performance.percentage_gain_loss}%)`;

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance: Projected vs Actual Returns
                </h3>

                {performance.investments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No performance data available
                    </p>
                ) : (
                    <>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => `RM ${value}`} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(Number(value) * 100), '']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Projected" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-gray-600 mt-4 text-center">
                            {summaryText}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
