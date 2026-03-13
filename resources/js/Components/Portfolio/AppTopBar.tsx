import { Link } from '@inertiajs/react';
import { IconBell } from '@/Components/Icons/AppIcons';

interface AppTopBarProps {
  /** Number of unread notifications to display on the badge. 0 or undefined hides the badge. */
  notificationCount?: number;
}

/**
 * Sticky top app bar for the mobile Portfolio shell.
 * Displays the Treevest logo/wordmark and a notification bell with a dynamic badge.
 */
export default function AppTopBar({ notificationCount = 0 }: AppTopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white px-5 pt-3 pb-3 flex items-center justify-between border-b border-gray-100">
      {/* Brand / Logo */}
      <span className="font-extrabold text-xl tracking-tight text-emerald-600 flex items-center gap-1.5">
        <span className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-white">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
        treevest
      </span>

      {/* Notification Bell */}
      <Link href={route('notifications.index')} className="relative p-2 text-gray-600">
        <IconBell />
        {notificationCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white font-bold flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Link>
    </div>
  );
}
