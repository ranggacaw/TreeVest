import React from 'react';
import { useTranslation } from 'react-i18next';
import { FarmStatus } from '@/types';

interface Props {
    status: FarmStatus;
}

export default function FarmStatusBadge({ status }: Props) {
    const { t } = useTranslation();

    const styles: Record<FarmStatus, string> = {
        pending_approval: 'bg-sun-100 text-sun-800 border border-sun-200',
        active: 'bg-sage-100 text-sage-800 border border-sage-200',
        suspended: 'bg-earth-100 text-earth-800 border border-earth-200',
        deactivated: 'bg-red-50 text-red-700 border border-red-100',
    };

    const labels: Record<FarmStatus, string> = {
        pending_approval: t('status.pending_approval', 'Pending Approval'),
        active: t('status.active', 'Active'),
        suspended: t('status.suspended', 'Suspended'),
        deactivated: t('status.deactivated', 'Deactivated'),
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
