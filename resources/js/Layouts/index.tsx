import AuthenticatedLayout from './AuthenticatedLayout';
import GuestLayout from './GuestLayout';
import { PropsWithChildren, ReactNode } from 'react';

// AppLayout wrapper: accepts optional `title` prop and converts it to `header` ReactNode
function AppLayout({
    title,
    subtitle,
    header,
    children,
}: PropsWithChildren<{ title?: string; subtitle?: string; header?: ReactNode }>) {
    const resolvedHeader = header ?? (title ? (
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-pine-500 font-medium text-sm">
                    {subtitle}
                </p>
            )}
        </div>
    ) : undefined);
    return <AuthenticatedLayout header={resolvedHeader}>{children}</AuthenticatedLayout>;
}

export { AppLayout, GuestLayout };
export default AuthenticatedLayout;
