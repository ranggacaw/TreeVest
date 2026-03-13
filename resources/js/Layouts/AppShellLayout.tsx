import { PropsWithChildren } from 'react';

/**
 * AppShellLayout — A zero-chrome layout for PWA-style full-screen pages.
 * Does NOT render the authenticated nav bar or header. Use this for pages
 * that manage their own navigation (e.g. Portfolio Dashboard with bottom nav).
 */
export default function AppShellLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center">
            {children}
        </div>
    );
}
