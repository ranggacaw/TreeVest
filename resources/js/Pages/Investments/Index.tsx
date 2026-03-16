import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps, Investment } from '@/types';
import { useTranslation } from 'react-i18next';
import { IconTree, IconDollar, IconChart } from '@/Components/Icons/AppIcons';
import { formatRupiah } from '@/utils/currency';

interface Props extends PageProps {
    investments: Investment[];
    total_value_idr: number;
    total_value_formatted: string;
}

export default function Index({ auth, investments, total_value_idr, total_value_formatted, unread_notifications_count }: Props) {
    const { t } = useTranslation('investments');

    return (
        <AppShellLayout>
            <Head title={t('my_investments')} />
            
            <div className="relative w-full max-w-md bg-bg flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unread_notifications_count} />

                    {/* Summary Section */}
                    <div className="bg-card p-6">
                        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <IconChart className="w-5 h-5 text-primary" />
                            {t('investment_summary', 'Investment Summary')}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                <p className="text-xs font-medium text-primary mb-1">{t('total_value', 'Total Value')}</p>
                                <p className="text-lg font-bold text-text truncate">
                                    {total_value_formatted || formatRupiah(total_value_idr)}
                                </p>
                            </div>
                            <div className="p-4 bg-bg rounded-2xl border border-border">
                                <p className="text-xs font-medium text-textSecondary mb-1">{t('active_trees', 'Active Trees')}</p>
                                <p className="text-lg font-bold text-text">
                                    {investments.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-3 bg-bg" />

                    {/* Investments List */}
                    <div className="bg-card p-6 min-h-[50vh]">
                        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <IconTree className="w-5 h-5 text-primary" />
                            {t('your_holdings', 'Your Holdings')}
                        </h3>

                        {investments.length === 0 ? (
                            <div className="text-center py-12 bg-bg rounded-2xl border border-border border-dashed">
                                <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-card">
                                    <IconTree className="w-8 h-8 text-textSecondary" />
                                </div>
                                <p className="text-textSecondary mb-4 text-sm">{t('no_investments_made', 'You have no investments yet.')}</p>
                                <Link
                                    href="/farms"
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-primary rounded-xl font-semibold text-sm text-white hover:bg-primary-dark transition-colors shadow-floating"
                                >
                                    {t('browse_fruit_trees', 'Browse Trees')}
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {investments.map((investment) => (
                                    <Link
                                        key={investment.id}
                                        href={route('investments.show', investment.id)}
                                        className="block p-4 rounded-2xl border border-border bg-card shadow-card hover:shadow-lg transition-shadow relative overflow-hidden group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <IconTree className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-text text-sm">
                                                        {investment.tree.identifier}
                                                    </h4>
                                                    <p className="text-xs text-textSecondary">
                                                        {investment.tree.fruit_crop?.farm?.name || t('unknown_farm', 'Unknown Farm')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                                                investment.status === 'active' ? 'bg-primary-50 text-primary-700' :
                                                investment.status === 'pending_payment' ? 'bg-warning-50 text-warning-700' :
                                                investment.status === 'cancelled' ? 'bg-danger-50 text-danger-700' :
                                                'bg-bg text-textSecondary'
                                            }`}>
                                                {investment.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <div>
                                                <p className="text-xs text-textSecondary mb-0.5">{t('invested', 'Invested')}</p>
                                                <p className="font-semibold text-text text-sm">
                                                    {investment.formatted_amount}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-textSecondary mb-0.5">{t('expected_roi', 'Exp. ROI')}</p>
                                                <p className="font-semibold text-primary text-sm">
                                                    {investment.tree.expected_roi || investment.tree.expected_roi_percent}%
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <BottomNav />
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AppShellLayout>
    );
}
