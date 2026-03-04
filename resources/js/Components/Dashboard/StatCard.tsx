import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    accent?: 'amber' | 'sage' | 'pine' | 'earth' | 'sun' | 'none';
    linkHref?: string;
    icon?: ReactNode;
}

export default function StatCard({ label, value, accent = 'none', linkHref, icon }: StatCardProps) {
    const getAccentBorder = () => {
        const colors: Record<string, string> = {
            amber: 'border-amber-400',
            sage: 'border-sage-400',
            pine: 'border-pine-400',
            earth: 'border-earth-400',
            sun: 'border-sun-400',
            none: 'border-sand-200',
        };
        return colors[accent] || 'border-sand-200';
    };

    const getAccentBg = () => {
        const colors: Record<string, string> = {
            amber: 'bg-amber-50',
            sage: 'bg-sage-50',
            pine: 'bg-pine-50',
            earth: 'bg-earth-50',
            sun: 'bg-sun-50',
            none: 'bg-white',
        };
        return colors[accent] || 'bg-white';
    };

    const content = (
        <div className={`p-6 rounded-3xl shadow-card border ${getAccentBorder()} ${getAccentBg()} transition-all hover:-translate-y-1`}>
            {icon && <div className="mb-3 text-pine-600">{icon}</div>}
            <h3 className="text-sm font-medium text-sand-600 mb-1">{label}</h3>
            <p className="text-2xl font-bold text-earth-900">{value}</p>
        </div>
    );

    if (linkHref) {
        return <Link href={linkHref} className="block">{content}</Link>;
    }

    return content;
}
