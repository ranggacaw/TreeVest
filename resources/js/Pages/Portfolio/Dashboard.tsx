import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    PageProps,
    PortfolioSummary,
    DiversificationData,
    HarvestEvent,
    PerformanceMetrics,
    PaginatedInvestments,
} from '@/types';
import PortfolioSummaryCard from '@/Components/Portfolio/PortfolioSummaryCard';
import HarvestCalendar from '@/Components/Portfolio/HarvestCalendar';
import DiversificationChart from '@/Components/Portfolio/DiversificationChart';
import PerformanceChart from '@/Components/Portfolio/PerformanceChart';
import InvestmentCard from '@/Components/Portfolio/InvestmentCard';
import EmptyPortfolio from '@/Components/Portfolio/EmptyPortfolio';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    summary: PortfolioSummary;
    diversification: {
        by_fruit_type: DiversificationData[];
        by_farm: DiversificationData[];
        by_risk: DiversificationData[];
    };
    performance: PerformanceMetrics;
    upcomingHarvests: HarvestEvent[];
    investments: PaginatedInvestments;
}

function formatCurrency(cents: number): string {
    return 'Rp ' + (cents / 100).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard({
    auth,
    summary,
    diversification,
    performance,
    upcomingHarvests,
    investments,
}: Props) {
    const { t } = useTranslation('investments');
    const hasInvestments = summary.tree_count > 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('my_portfolio')}
                </h2>
            }
        >
            <Head title={t('my_portfolio')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-5">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {t('back_to_dashboard')}
                        </button>
                    </div>
                    <FinancialErrorBoundary context="portfolio-dashboard">
                        {!hasInvestments ? (
                            <EmptyPortfolio />
                        ) : (
                            <>
                                <PortfolioSummaryCard summary={summary} formatCurrency={formatCurrency} />

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <HarvestCalendar
                                        harvests={upcomingHarvests}
                                    />
                                    <DiversificationChart
                                        data={diversification}
                                    />
                                </div>

                                <div className="mt-6">
                                    <PerformanceChart
                                        performance={performance}
                                        formatCurrency={formatCurrency}
                                    />
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {t('my_investments')}
                                        </h3>
                                        {investments.last_page > 1 && (
                                            <Link
                                                href="/investments"
                                                className="text-sm text-green-600 hover:text-green-700"
                                            >
                                                {t('view_all', { count: investments.total })}
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {investments.data.map((investment) => (
                                            <InvestmentCard
                                                key={investment.id}
                                                investment={investment}
                                                formatCurrency={formatCurrency}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </FinancialErrorBoundary>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
