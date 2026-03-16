import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PerformanceMetrics } from '@/types';

interface Props {
    performance: PerformanceMetrics;
    formatCurrency: (idr: number) => string;
}

export default function PerformanceChart({ performance, formatCurrency }: Props) {
    const hasActualReturns = performance.investments.some(inv => inv.actual_return_idr > 0);

    const chartData = performance.investments.slice(0, 10).map(inv => ({
        name: inv.tree_identifier || `Inv #${inv.investment_id}`,
        Projected: inv.projected_return_idr,
        Actual: inv.actual_return_idr,
    }));

    const summaryText = `Total projected: ${formatCurrency(performance.projected_returns_idr)} | Total actual: ${formatCurrency(performance.actual_returns_idr)} | Difference: ${performance.difference_idr >= 0 ? '+' : ''}${formatCurrency(performance.difference_idr)} (${performance.percentage_gain_loss >= 0 ? '+' : ''}${performance.percentage_gain_loss}%)`;

    return (
        <div className="bg-card overflow-hidden shadow-card sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-text mb-4">
                    Performance: Projected vs Actual Returns
                </h3>

                {performance.investments.length === 0 ? (
                    <p className="text-textSecondary text-center py-8">
                        No performance data available
                    </p>
                ) : (
                    <>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7B8A87' }} />
                                    <YAxis tickFormatter={(value) => `Rp ${value}`} tick={{ fontSize: 12, fill: '#7B8A87' }} />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(Number(value)), '']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Projected" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Actual" fill="#2E9F6B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-textSecondary mt-4 text-center">
                            {summaryText}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
