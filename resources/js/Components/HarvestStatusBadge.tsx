import { HarvestStatus } from '@/types';

export const STATUS_CONFIG: Record<
    HarvestStatus,
    { label: string; badge: string; dot: string; className?: string }
> = {
    scheduled: {
        label: 'Scheduled',
        badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        dot: 'bg-blue-500',
    },
    in_progress: {
        label: 'In Progress',
        badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        dot: 'bg-amber-500',
    },
    completed: {
        label: 'Completed',
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        dot: 'bg-emerald-500',
    },
    failed: {
        label: 'Failed',
        badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        className: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        dot: 'bg-red-500',
    },
};

export const ALL_STATUSES: Array<{ value: HarvestStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
];

export default function HarvestStatusBadge({ status }: { status: HarvestStatus }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
        className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
        dot: 'bg-gray-400',
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge || cfg.className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
