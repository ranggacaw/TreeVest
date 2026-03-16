import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-bg pt-6 sm:justify-center sm:pt-0">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-primary" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-card px-6 py-4 shadow-card sm:max-w-md sm:rounded-card border border-border">
                {children}
            </div>
        </div>
    );
}
