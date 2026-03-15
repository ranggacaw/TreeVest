import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, Payout, PayoutStatus } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconDollar, IconCheck, IconX, IconFlash } from '@/Components/Icons/AppIcons';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedPayouts {
  data: Payout[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props extends PageProps {
  payouts: PaginatedPayouts;
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  const map: Record<PayoutStatus, { label: string; cls: string; icon: any }> = {
    pending:    { label: 'Menunggu',  cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: IconFlash },
    processing: { label: 'Diproses', cls: 'bg-blue-50 text-blue-600 border-blue-100', icon: IconFlash },
    completed:  { label: 'Selesai',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: IconCheck },
    failed:     { label: 'Gagal',    cls: 'bg-red-50 text-red-500 border-red-100', icon: IconX },
  };
  const item = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-100', icon: IconDollar };
  const Icon = item.icon;
  
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${item.cls}`}>
      <Icon className="w-3 h-3" />
      {item.label}
    </span>
  );
}

export default function PayoutsIndex({ payouts }: Props) {
  const page = usePage();
  const unreadCount = (page.props as any).unread_notifications_count ?? 0;

  // Helper to get farm name from investment (tree or lot based)
  const getFarmName = (payout: Payout): string => {
    if (payout.harvest?.tree?.fruit_crop?.farm) {
      return payout.harvest.tree.fruit_crop.farm.name;
    }
    if ((payout.investment as any)?.tree?.fruit_crop?.farm) {
      return (payout.investment as any).tree.fruit_crop.farm.name;
    }
    if ((payout.investment as any)?.lot?.fruit_crop?.farm) {
      return (payout.investment as any).lot.fruit_crop.farm.name;
    }
    return 'Farm Name';
  };

  return (
    <AppShellLayout>
      <Head title="Payouts Saya" />
      <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
          <AppTopBar notificationCount={unreadCount} />
          
          {/* Header Section */}
          <div className="bg-white px-5 pt-5 pb-6">
            <h1 className="text-[20px] font-extrabold text-gray-900 mb-1">Payouts Saya</h1>
            <p className="text-[13px] text-gray-500">Riwayat pencairan keuntungan investasi Anda.</p>
          </div>

          <div className="h-3 bg-gray-50" />

          {/* List Section */}
          <div className="bg-white px-5 pt-5 pb-6 min-h-[50vh]">
            <div className="space-y-3">
              {payouts.data.length > 0 ? (
                payouts.data.map((payout) => (
                  <Link 
                    key={payout.id} 
                    href={route('investor.payouts.show', payout.id)}
                    className="block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                            {new Date(payout.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <StatusBadge status={payout.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                             <p className="text-[13px] font-bold text-gray-900 line-clamp-1">
                                {getFarmName(payout)}
                             </p>
                             <p className="text-[11px] text-gray-500 mt-0.5">Via {payout.payout_method?.replace('_', ' ') ?? 'Transfer'}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[15px] font-extrabold text-emerald-600">+{formatRupiah(payout.net_amount_idr)}</p>
                        </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IconDollar className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Belum ada riwayat payout.</p>
                </div>
              )}
            </div>

             {payouts.links.length > 3 && (
                <div className="flex justify-center mt-6 gap-1">
                  {payouts.links.map((link, i) => (
                    link.url ? (
                      <Link
                        key={i}
                        href={link.url}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${link.active ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ) : (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs rounded-lg text-gray-400 font-medium"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    )
                  ))}
                </div>
              )}
          </div>
        </div>
        <BottomNav />
      </div>
      <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
    </AppShellLayout>
  );
}
