import React from 'react';
import { FarmStatus } from '@/types';

interface Props {
    status: FarmStatus;
}

export default function FarmStatusBadge({ status }: Props) {
    const styles: Record<FarmStatus, string> = {
        pending_approval: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        suspended: 'bg-orange-100 text-orange-800',
        deactivated: 'bg-red-100 text-red-800',
    };

    const labels: Record<FarmStatus, string> = {
        pending_approval: 'Pending Approval',
        active: 'Active',
        suspended: 'Suspended',
        deactivated: 'Deactivated',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
