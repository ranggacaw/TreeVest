import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import FarmImageGallery from '@/Components/FarmImageGallery';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import FarmMap from '@/Components/FarmMap';
import AgrotourismEventCard from '@/Components/AgrotourismEventCard';
import { Farm } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import { IconArrowLeft, IconMapPin, IconCalendar, IconInfoCircle, IconTree, IconChart } from '@/Components/Icons/AppIcons';

interface Props {
  farm: Farm;
}

export default function Show({ farm }: Props) {
  const { t } = useTranslation('farms');
  const page = usePage();
  const unreadCount = (page.props as any).unread_notifications_count ?? 0;
  
  const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({});

  const toggleCrop = (cropId: number) => {
    setExpandedCrops(prev => ({
      ...prev,
      [cropId]: !prev[cropId]
    }));
  };

  return (
    <AppShellLayout>
      <Head title={farm.name} />

      {/* App Shell — mobile-first max-w-md container */}
      <div 
        className="relative w-full max-w-md mx-auto bg-gray-50 flex flex-col"
        style={{ height: '100dvh' }}
      >
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
          
          {/* Top App Bar */}
          <AppTopBar notificationCount={unreadCount} />

          {/* Back + Breadcrumb */}
          <div className="bg-white px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
            <Link
              href="/farms"
              className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Back"
            >
              <IconArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-400 truncate uppercase tracking-widest font-semibold">
                {t('farm_details', 'Farm Details')}
              </p>
              <h1 className="text-sm font-bold text-gray-900 truncate">
                {farm.name}
              </h1>
            </div>
            <FarmStatusBadge status={farm.status} />
          </div>

          {/* Hero Image / Gallery */}
          <div className="relative">
            {farm.images && farm.images.length > 0 ? (
                <div className="w-full h-56">
                    <img src={farm.images[0].file_path.startsWith('http') ? farm.images[0].file_path : `/storage/${farm.images[0].file_path}`} alt={farm.name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-full h-56 flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                        <IconTree className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">{t('no_images_available')}</span>
                    </div>
                </div>
            )}
            
            <div className="absolute bottom-3 left-3 flex gap-2 w-full pr-6">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-1 max-w-[90%] truncate">
                    <IconMapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{farm.city}, {farm.country}</span>
                </span>
            </div>
          </div>

          <div className="h-3 bg-gray-50" />

          {/* Core Info */}
          <div className="bg-white px-5 pt-5 pb-6">
              <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-none mb-4">
                  {farm.name}
              </h2>
              {farm.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">
                      {farm.description}
                  </p>
              )}
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
                          {t('size')}
                      </p>
                      <p className="text-lg font-bold text-gray-900 leading-none">
                          {farm.size_hectares} {t('hectares')}
                      </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
                          {t('capacity')}
                      </p>
                      <p className="text-lg font-bold text-gray-900 leading-none">
                          {farm.capacity_trees?.toLocaleString()} {t('trees')}
                      </p>
                  </div>
                  {farm.soil_type && (
                     <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
                            {t('soil_type')}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-none mt-1 line-clamp-2">
                            {farm.soil_type}
                        </p>
                     </div>
                  )}
                  {farm.climate && (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">
                            {t('climate')}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-none mt-1 line-clamp-2">
                            {farm.climate}
                        </p>
                     </div>
                  )}
              </div>
          </div>

          <div className="h-3 bg-gray-50" />

          {/* Historical Performance */}
          {farm.historical_performance && (
            <>
                <div className="bg-white px-5 pt-5 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            <IconChart className="w-4 h-4 text-emerald-600" />
                            {t('historical_performance')}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 bg-emerald-50 border border-emerald-100 p-4 rounded-xl leading-relaxed">
                        {farm.historical_performance}
                    </p>
                </div>
                <div className="h-3 bg-gray-50" />
            </>
          )}

          {/* Certifications */}
          {farm.certifications && farm.certifications.length > 0 && (
             <>
                 <div className="bg-white px-5 pt-5 pb-6">
                     <h3 className="text-sm font-bold text-gray-900 mb-4">{t('certifications')}</h3>
                     <div className="space-y-3">
                         {farm.certifications.map((cert) => (
                             <div key={cert.id} className="border border-gray-100 bg-white shadow-sm rounded-xl p-4">
                                <h4 className="font-bold text-sm text-gray-900">{cert.name}</h4>
                                <div className="mt-2 text-[12px] text-gray-500 space-y-1">
                                    {cert.issuer && <p><span className="font-semibold text-gray-700">{t('issuer')}:</span> {cert.issuer}</p>}
                                    {cert.certificate_number && <p><span className="font-semibold text-gray-700">{t('certificate_no')}:</span> {cert.certificate_number}</p>}
                                    {cert.expiry_date && <p><span className="font-semibold text-gray-700">{t('expires')}:</span> {cert.expiry_date}</p>}
                                </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 <div className="h-3 bg-gray-50" />
             </>
          )}

          {/* Location & Map */}
          <div className="bg-white px-5 pt-5 pb-6">
             <h3 className="text-sm font-bold text-gray-900 mb-4">{t('location')}</h3>
             <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
                {farm.latitude && farm.longitude ? (
                  <FarmMap farms={[farm]} zoom={13} />
                ) : (
                  <div className="bg-gray-100 h-32 flex items-center justify-center border border-gray-200">
                    <p className="text-xs text-gray-500">{t('location_not_available')}</p>
                  </div>
                )}
             </div>
             <p className="text-[13px] text-gray-600 leading-relaxed font-medium bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                {farm.address}<br />
                {farm.city}, {farm.state} {farm.postal_code}<br />
                {farm.country}
             </p>
             {farm.virtual_tour_url && (
                 <a
                  href={farm.virtual_tour_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  {t('view_virtual_tour')}
                </a>
             )}
          </div>

          <div className="h-3 bg-gray-50" />

          {/* Agrotourism Events */}
          {farm.agrotourism_events && farm.agrotourism_events.length > 0 && (
             <>
                <div className="bg-white px-5 pt-5 pb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">{t('upcoming_agrotourism_events', 'Upcoming Events')}</h3>
                    <div className="space-y-4">
                        {farm.agrotourism_events.map((event: any) => (
                            <AgrotourismEventCard
                                key={event.id}
                                event={event}
                                registrationRoute={route('investor.agrotourism.index')}
                            />
                        ))}
                    </div>
                </div>
                <div className="h-3 bg-gray-50" />
             </>
          )}

          {/* Investment Opportunities */}
          {farm.fruit_crops && farm.fruit_crops.length > 0 && (
             <div className="bg-white px-5 pt-5 pb-8">
                <h3 className="text-sm font-bold text-gray-900 mb-4">{t('investment_opportunities')}</h3>
                
                <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-100">
                    <div className="flex gap-2.5">
                        <IconInfoCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">{t('understanding_your_investment', 'How It Works')}</h4>
                            <p className="text-[12px] text-emerald-700 mt-1.5 leading-relaxed">
                                Pick a tree, review ROI and age. Capital is returned after complete harvest loop or selected period.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {farm.fruit_crops.map((crop) => {
                      const isMinimized = expandedCrops[crop.id];
                      return (
                      <div key={crop.id} className="border border-gray-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                        <div 
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleCrop(crop.id)}
                        >
                            <div className="flex-1 pr-3">
                                <h4 className="font-bold text-gray-900 text-[15px] flex items-center gap-1.5 align-middle break-words">
                                    {crop.fruit_type?.name}{' '}
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                                        {crop.variant}
                                    </span>
                                </h4>
                                {crop.description && <p className="text-[12px] text-gray-500 mt-1.5 line-clamp-2">{crop.description}</p>}
                                {isMinimized && crop.trees && crop.trees.length > 0 && (
                                    <p className="text-[11px] font-semibold text-emerald-600 mt-2">{crop.trees.length} {t('options_available', 'Investment Options Available')}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('cycle')}</p>
                                    <p className="text-xs font-bold text-gray-700 capitalize mt-0.5">{crop.harvest_cycle}</p>
                                </div>
                                <div className="text-gray-400 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isMinimized ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                {crop.trees && crop.trees.length > 0 ? (
                                    <div className="space-y-3">
                                        {crop.trees.map((tree: any) => (
                                            <div key={tree.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 hover:border-emerald-200 transition-colors relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-2 gap-2 relative z-10">
                                                    <span className="font-mono text-[11px] text-gray-500 font-semibold uppercase truncate">
                                                        #{tree.tree_identifier || tree.identifier}
                                                    </span>
                                                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                                                        ROI {tree.expected_roi_percent}%
                                                    </span>
                                                </div>
                                                
                                                <div className="text-[15px] font-extrabold text-gray-900 mb-2 truncate relative z-10">
                                                    {formatRupiah(tree.price_idr)}
                                                </div>

                                                {tree.age_years !== undefined && tree.productive_lifespan_years !== undefined && (
                                                    <div className="flex text-[10px] text-gray-500 mb-3 justify-between font-medium relative z-10">
                                                        <span>{t('age')}: {tree.age_years} {t('yrs_short', 'thn')}</span>
                                                        <span>{t('total')}: {tree.productive_lifespan_years} {t('yrs_short', 'thn')}</span>
                                                    </div>
                                                )}

                                                <Link
                                                    href={`/investments/create/${tree.id}`}
                                                    className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2 text-[13px] font-bold transition-colors relative z-10"
                                                >
                                                    {t('invest_now')}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-500 border border-dashed border-gray-200">
                                        {t('no_trees_available')}
                                    </div>
                                )}
                            </div>
                        )}
                      </div>
                    )})}
                </div>
             </div>
          )}

        </div>{/* End Scrollable Area */}
        
        {/* Fixed Bottom Navigation */}
        <BottomNav />

      </div>

      <style>{`
          ::-webkit-scrollbar { display: none; }
          * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </AppShellLayout>
  );
}
