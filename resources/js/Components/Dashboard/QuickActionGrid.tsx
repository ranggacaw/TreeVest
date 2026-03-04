import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface ActionItem {
    label: string;
    href: string;
    icon?: ReactNode;
    color?: 'pine' | 'sage' | 'earth';
}

interface QuickActionGridProps {
    actions: ActionItem[];
}

export default function QuickActionGrid({ actions }: QuickActionGridProps) {
    if (actions.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => {
                const colors = {
                    pine: 'bg-pine-50 text-pine-700 hover:bg-pine-100 border-pine-200',
                    sage: 'bg-sage-50 text-sage-800 hover:bg-sage-100 border-sage-200',
                    earth: 'bg-earth-50 text-earth-800 hover:bg-earth-100 border-earth-200',
                };

                const themeClass = colors[action.color || 'pine'];

                return (
                    <Link
                        key={index}
                        href={action.href}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all hover:-translate-y-0.5 ${themeClass}`}
                    >
                        {action.icon && <div className="mb-2 h-6 w-6">{action.icon}</div>}
                        <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
