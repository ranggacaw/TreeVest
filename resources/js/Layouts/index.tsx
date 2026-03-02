import AuthenticatedLayout from './AuthenticatedLayout';
import GuestLayout from './GuestLayout';
import { PropsWithChildren, ReactNode } from 'react';

// AppLayout wrapper: accepts optional `title` prop and converts it to `header` ReactNode
function AppLayout({
    title,
    header,
    children,
}: PropsWithChildren<{ title?: string; header?: ReactNode }>) {
    const resolvedHeader = header ?? (title ? <h2 className="text-xl font-semibold leading-tight text-gray-800">{title}</h2> : undefined);
    return <AuthenticatedLayout header={resolvedHeader}>{children}</AuthenticatedLayout>;
}

export { AppLayout, GuestLayout };
export default AuthenticatedLayout;
