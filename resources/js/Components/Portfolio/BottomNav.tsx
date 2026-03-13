import { Link } from '@inertiajs/react';
import { NavHome, NavPie, NavArrow, NavUser } from '@/Components/Icons/AppIcons';

export type BottomNavTab = 'home' | 'portfolio' | 'transactions' | 'profile';

interface BottomNavProps {
  /** Which tab is currently active. Defaults to 'home'. */
  activeTab?: BottomNavTab;
}

/**
 * Fixed bottom navigation bar for the mobile Portfolio app shell.
 * Accepts an `activeTab` prop to highlight the correct item.
 */
export default function BottomNav({ activeTab }: BottomNavProps) {
  // Automatically determine active tab if not provided
  const currentTab = activeTab || (
    (route().current('dashboard') || route().current('investor.dashboard')) ? 'home' :
      (route().current('portfolio.dashboard') ||
        route().current('investor.wishlist.index') ||
        route().current('reports.*') ||
        route().current('investments.*')) ? 'portfolio' :
        route().current('investor.payouts.*') ? 'transactions' :
          (route().current('profile.*') ||
            route().current('notifications.*') ||
            route().current('settings.*') ||
            route().current('kyc.*')) ? 'profile' :
            undefined
  );

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center px-4 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: '5px',
        height: '55px',
      }}
    >
      {/* Home */}
      <Link href={route('dashboard')} className="flex flex-col items-center gap-0.5">
        <NavHome active={currentTab === 'home'} />
        <span
          className={`text-[9px] font-semibold ${currentTab === 'home' ? 'text-emerald-600' : 'text-gray-400'
            }`}
        >
          Home
        </span>
      </Link>

      {/* Portfolio */}
      <Link href={route('portfolio.dashboard')} className="flex flex-col items-center gap-0.5">
        <NavPie active={currentTab === 'portfolio'} />
        <span
          className={`text-[9px] font-medium ${currentTab === 'portfolio' ? 'text-emerald-600' : 'text-gray-400'
            }`}
        >
          Portofolio
        </span>
      </Link>

      {/* Center FAB — Invest */}
      <Link
        href={route('trees.index')}
        className="flex flex-col items-center gap-0.5 -mt-8"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Investasi Baru"
      >
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-300/60 border-4 border-white">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </Link>

      {/* Transactions */}
      <Link href={route('investor.payouts.index')} className="flex flex-col items-center gap-0.5">
        <NavArrow active={currentTab === 'transactions'} />
        <span
          className={`text-[9px] font-medium ${currentTab === 'transactions' ? 'text-emerald-600' : 'text-gray-400'
            }`}
        >
          Transaksi
        </span>
      </Link>

      {/* Profile */}
      <Link href={route('profile.edit')} className="flex flex-col items-center gap-0.5">
        <NavUser active={currentTab === 'profile'} />
        <span
          className={`text-[9px] font-medium ${currentTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'
            }`}
        >
          Profil
        </span>
      </Link>
    </div>
  );
}
