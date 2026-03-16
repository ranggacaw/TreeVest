import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import RiskBadge from '@/Components/RiskBadge';
import HarvestCycleIcon from '@/Components/HarvestCycleIcon';
import HealthStatusIndicator from '@/Components/HealthStatusIndicator';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import WishlistToggleButton from '@/Components/WishlistToggleButton';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconArrowLeft, IconTree, IconPlant, IconCalendar, IconInfoCircle } from '@/Components/Icons/AppIcons';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';

// ─── Harvest Status Badge ─────────────────────────────────────────────────────
function HarvestStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        scheduled:   { label: 'Scheduled',    className: 'bg-blue-100 text-blue-700' },
        in_progress: { label: 'In Progress',  className: 'bg-yellow-100 text-yellow-700' },
        completed:   { label: 'Completed',    className: 'bg-emerald-100 text-emerald-700' },
        failed:      { label: 'Failed',       className: 'bg-red-100 text-red-700' },
    };
    const { label, className } = config[status] ?? { label: status ?? '-', className: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}>
            {label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Show({ tree, auth, isWishlisted, healthStatus, recentUpdates, currentWeather }: PageProps<{
    tree: any;
    isWishlisted?: boolean;
    healthStatus?: any;
    recentUpdates?: any[];
    currentWeather?: any;
}>) {
    const { t } = useTranslation('trees');
    const page = usePage<PageProps>();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    const crop = tree?.fruit_crop;
    const farm = crop?.farm;
    const fruitType = crop?.fruit_type;
    const fruitTypeName = typeof fruitType === 'string' ? fruitType : fruitType?.name;

    const price = formatRupiah(tree?.price_idr ?? 0);
    const minInv = formatRupiah(tree?.min_investment_idr ?? 0);
    const maxInv = formatRupiah(tree?.max_investment_idr ?? 0);
    const authenticated = !!auth?.user;

    const remainingYears = Math.max(0, (tree?.productive_lifespan_years ?? 0) - (tree?.age_years ?? 0));

    const weatherIcon = currentWeather?.weather_condition?.includes('rain') ? '🌧️'
        : currentWeather?.weather_condition?.includes('cloud') ? '☁️'
        : '☀️';

    return (
        <AppShellLayout>
            <Head title={t('invest_in_tree', { name: fruitTypeName })} />

            {/* App Shell — mobile-first max-w-md container */}
            <div
                className="relative w-full max-w-md bg-gray-50 flex flex-col"
                style={{ height: '100dvh' }}
            >
                {/* ── Scrollable Area ──────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>

                    {/* ── Top App Bar ──────────────────────────────────────── */}
                    <AppTopBar notificationCount={unreadCount} />

                    {/* ── Back + Breadcrumb ────────────────────────────────── */}
                    <div className="bg-white px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
                        <Link
                            href={farm?.id ? route('farms.show', farm.id) : route('trees.index')}
                            className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Back"
                        >
                            <IconArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-gray-400 truncate">
                                {farm?.name ?? t('tree_marketplace')}
                                <span className="mx-1.5 text-gray-300">›</span>
                                {fruitTypeName} ({crop?.variant})
                            </p>
                            <h1 className="text-sm font-bold text-gray-900 truncate">
                                Tree #{tree.tree_identifier}
                            </h1>
                        </div>
                        <WishlistToggleButton
                            treeId={tree.id}
                            isWishlisted={isWishlisted ?? false}
                            authenticated={authenticated}
                        />
                    </div>

                    {/* ── Hero Image ───────────────────────────────────────── */}
                    <div className="relative h-52 bg-gray-200 overflow-hidden">
                        {farm?.image_url ? (
                            <img
                                src={farm.image_url}
                                alt={farm.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                <div className="text-center">
                                    <IconTree className="w-16 h-16 text-emerald-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">{t('no_image_available')}</p>
                                </div>
                            </div>
                        )}
                        {/* Overlaid badges */}
                        <div className="absolute top-3 left-3">
                            <RiskBadge rating={tree.risk_rating} className="text-xs px-2.5 py-1 shadow-sm" />
                        </div>
                        {/* Fruit type chip */}
                        <div className="absolute bottom-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                                {fruitTypeName} · {crop?.variant}
                            </span>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Key Metrics ──────────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                            {t('tree_investment')}
                        </p>
                        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-none mb-5">
                            {price}
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {/* ROI */}
                            <div className="bg-emerald-50 rounded-2xl p-4">
                                <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">
                                    {t('expected_roi')}
                                </p>
                                <p className="text-[26px] font-extrabold text-emerald-600 leading-none">
                                    {tree.expected_roi_percent}%
                                </p>
                            </div>

                            {/* Tree Age */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                    {t('tree_age')}
                                </p>
                                <p className="text-[22px] font-extrabold text-gray-900 leading-none">
                                    {t('years', { count: tree.age_years })}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {t('remaining_productivity')}: {t('years', { count: remainingYears })}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">
                                    {t('status')}
                                </p>
                                <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold capitalize">
                                    {tree.status}
                                </span>
                            </div>

                            {/* Harvest Cycle */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">
                                    {t('harvest_cycle_label')}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <HarvestCycleIcon cycle={crop?.harvest_cycle} className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-800 capitalize">
                                        {crop?.harvest_cycle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Investment Limits ────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">{t('investment_limits')}</h3>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">
                                    {t('minimum')}
                                </p>
                                <p className="font-extrabold text-gray-900 text-[15px]">{minInv}</p>
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">
                                    {t('maximum')}
                                </p>
                                <p className="font-extrabold text-gray-900 text-[15px]">{maxInv}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Health Status ────────────────────────────────────── */}
                    {healthStatus && (
                        <>
                            <div className="bg-white px-5 pt-5 pb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-900">{t('health_status')}</h3>
                                    <HealthStatusIndicator status={healthStatus.overall_status} size="md" />
                                </div>

                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('last_updated')}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {healthStatus.last_update_date
                                                ? new Date(healthStatus.last_update_date).toLocaleDateString()
                                                : t('no_updates_yet')}
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('active_alerts')}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {healthStatus.active_alerts_count || 0}
                                        </p>
                                    </div>
                                </div>

                                {recentUpdates && recentUpdates.length > 0 && (
                                    <>
                                        <h4 className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-3">
                                            {t('recent_updates')}
                                        </h4>
                                        <div className="space-y-2.5">
                                            {recentUpdates.slice(0, 3).map((update: any) => {
                                                if (!update) return null;
                                                return (
                                                    <Link
                                                        key={update.id}
                                                        href={route('investments.health-feed.show', update.id)}
                                                        className="flex items-start justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="min-w-0 flex-1 pr-3">
                                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                                                                {update?.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400">
                                                                {update?.created_at
                                                                    ? new Date(update.created_at).toLocaleDateString()
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        <HealthSeverityBadge severity={update?.severity} />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                        <Link
                                            href={route('investments.health-feed.index')}
                                            className="mt-4 flex items-center justify-center gap-1.5 text-sm text-emerald-600 font-bold py-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors"
                                        >
                                            {t('view_all_updates')}
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Section divider */}
                            <div className="h-3 bg-gray-50" />
                        </>
                    )}

                    {/* ── Current Weather ──────────────────────────────────── */}
                    {currentWeather && (
                        <>
                            <div className="bg-white px-5 pt-5 pb-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">{t('current_weather')}</h3>

                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-[32px] font-extrabold text-gray-900 leading-none">
                                            {currentWeather.temperature_celsius}°C
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize mt-1">
                                            {currentWeather.weather_condition}
                                        </p>
                                    </div>
                                    <span className="text-5xl">{weatherIcon}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('humidity')}
                                        </p>
                                        <p className="text-base font-bold text-gray-900">
                                            {currentWeather.humidity_percent}%
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('wind_speed')}
                                        </p>
                                        <p className="text-base font-bold text-gray-900">
                                            {currentWeather.wind_speed_kmh} km/h
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('rainfall')}
                                        </p>
                                        <p className="text-base font-bold text-gray-900">
                                            {currentWeather.rainfall_mm || 0} mm
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3.5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                                            {t('updated')}
                                        </p>
                                        <p className="text-base font-bold text-gray-900">
                                            {new Date(currentWeather.recorded_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section divider */}
                            <div className="h-3 bg-gray-50" />
                        </>
                    )}

                    {/* ── Historical Harvests ──────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <IconCalendar className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-gray-900">{t('historical_harvests')}</h3>
                        </div>

                        {tree.harvests && tree.harvests.length > 0 ? (
                            <div className="space-y-3">
                                {tree.harvests.map((harvest: any) => (
                                    <div key={harvest.id} className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {new Date(harvest.harvest_date).toLocaleDateString()}
                                                </p>
                                                {harvest.quality_grade && (
                                                    <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                                                        {t('grade')}: {harvest.quality_grade}
                                                    </p>
                                                )}
                                            </div>
                                            <HarvestStatusBadge status={harvest.status} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                                                    {t('estimated_yield')}
                                                </p>
                                                <p className="text-sm font-bold text-gray-700">
                                                    {harvest.estimated_yield_kg ? `${harvest.estimated_yield_kg} kg` : '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                                                    {t('actual_yield')}
                                                </p>
                                                <p className="text-sm font-bold text-emerald-600">
                                                    {harvest.actual_yield_kg ? `${harvest.actual_yield_kg} kg` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                                <IconCalendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">{t('no_historical_data')}</p>
                            </div>
                        )}
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Risk Disclosure ──────────────────────────────────── */}
                    <div className="px-5 pb-5">
                        <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                            <IconInfoCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[12px] text-amber-700 leading-relaxed">
                                <span className="font-bold">{t('risk_disclosure_title')} </span>
                                {t('risk_disclosure_text')}
                            </p>
                        </div>
                    </div>

                </div>{/* end scrollable */}

                {/* ── Sticky CTA ───────────────────────────────────────────── */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}
                >
                    <Link
                        href={authenticated ? route('investments.create', tree.id) : route('login')}
                        className="w-full flex items-center justify-center py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[15px] rounded-2xl shadow-md shadow-emerald-200/60 transition-colors"
                    >
                        {t('invest_now')}
                    </Link>
                </div>

                {/* ── Fixed Bottom Navigation ──────────────────────────────── */}
                <BottomNav />

            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
