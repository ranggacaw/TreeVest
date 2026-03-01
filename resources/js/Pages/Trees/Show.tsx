import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import RiskBadge from '@/Components/RiskBadge';
import HarvestCycleIcon from '@/Components/HarvestCycleIcon';
import HealthStatusIndicator from '@/Components/HealthStatusIndicator';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';

export default function Show({ tree, auth, healthStatus, recentUpdates, currentWeather }: PageProps<{ 
    tree: any; 
    healthStatus?: any;
    recentUpdates?: any[];
    currentWeather?: any;
}>) {
    const crop = tree.fruit_crop;
    const farm = crop?.farm;
    const fruitType = crop?.fruit_type;
    const price = (tree.price_cents / 100).toFixed(2);
    const minInv = (tree.min_investment_cents / 100).toFixed(2);
    const maxInv = (tree.max_investment_cents / 100).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title={`Invest in ${fruitType?.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <Link href={route('farms.show', farm?.id)} className="hover:text-gray-900">{farm?.name}</Link>
                        </li>
                        <li>
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <span className="text-gray-900 font-medium">{fruitType?.name} ({crop?.variant})</span>
                        </li>
                        <li>
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <span className="text-gray-900 font-medium">Tree #{tree.tree_identifier}</span>
                        </li>
                    </ol>
                </nav>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Side */}
                        <div className="h-96 md:h-auto bg-gray-200 relative">
                            {farm?.image_url ? (
                                <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-green-50 text-xl font-medium">
                                    No Image Available
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <RiskBadge rating={tree.risk_rating} className="text-sm px-3 py-1" />
                            </div>
                        </div>

                        {/* Details Side */}
                        <div className="p-8 flex flex-col">
                            <div className="mb-2 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                                {fruitType?.name} - {crop?.variant}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tree Investment</h1>
                            
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Expected ROI</div>
                                    <div className="text-2xl font-bold text-green-600">{tree.expected_roi_percent}%</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Current Price</div>
                                    <div className="text-2xl font-bold text-gray-900">RM {price}</div>
                                </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Tree Age</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{tree.age_years} Years</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Lifespan</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{tree.productive_lifespan_years} Years</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">{tree.status}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Harvest Cycle</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize flex items-center gap-2">
                                        <HarvestCycleIcon cycle={crop?.harvest_cycle} className="w-5 h-5 text-gray-400" />
                                        {crop?.harvest_cycle}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Limits</h3>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Minimum: <strong className="text-gray-900">RM {minInv}</strong></span>
                                    <span>Maximum: <strong className="text-gray-900">RM {maxInv}</strong></span>
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Risk Disclosure:</strong> Agricultural investments are subject to weather, pest, and market risks. Past yields do not guarantee future returns.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Invest Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Health Status & Weather Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Health Status Section */}
                    {healthStatus && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Health Status</h2>
                                <HealthStatusIndicator status={healthStatus.overall_status} size="md" />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="text-gray-900 font-medium">
                                        {healthStatus.last_update_date ? 
                                            new Date(healthStatus.last_update_date).toLocaleDateString() : 
                                            'No updates yet'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Active Alerts:</span>
                                    <span className="text-gray-900 font-medium">{healthStatus.active_alerts_count || 0}</span>
                                </div>
                            </div>

                            {recentUpdates && recentUpdates.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Updates</h3>
                                    <div className="space-y-3">
                                        {recentUpdates.slice(0, 3).map((update: any) => (
                                            <Link 
                                                key={update.id} 
                                                href={route('investments.health-feed.show', update.id)}
                                                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                                                        {update.title}
                                                    </span>
                                                    <HealthSeverityBadge severity={update.severity} />
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(update.created_at).toLocaleDateString()}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link 
                                        href={route('investments.health-feed')}
                                        className="mt-3 inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        View all updates →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Current Weather Section */}
                    {currentWeather && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Weather</h2>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-4xl font-bold text-gray-900">
                                        {currentWeather.temperature_celsius}°C
                                    </div>
                                    <div className="text-sm text-gray-600 capitalize">
                                        {currentWeather.weather_condition}
                                    </div>
                                </div>
                                <div className="text-6xl">
                                    {currentWeather.weather_condition?.includes('rain') ? '🌧️' : 
                                     currentWeather.weather_condition?.includes('cloud') ? '☁️' : 
                                     '☀️'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Humidity</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {currentWeather.humidity_percent}%
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Wind Speed</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {currentWeather.wind_speed_kmh} km/h
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Rainfall</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {currentWeather.rainfall_mm || 0} mm
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Updated</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {new Date(currentWeather.recorded_at).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Historical Yields section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Historical Harvests</h2>
                    {tree.harvests && tree.harvests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Yield (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Yield (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tree.harvests.map((harvest: any) => (
                                        <tr key={harvest.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(harvest.harvest_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{harvest.estimated_yield_kg}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{harvest.actual_yield_kg || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{harvest.quality_grade || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                            No historical harvest data available for this tree yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
