import React from 'react';

interface Props {
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
}

export default function KycStatusBadge({ status }: Props) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        submitted: 'bg-blue-100 text-blue-800',
        verified: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
        pending: 'Pending',
        submitted: 'Submitted',
        verified: 'Verified',
        rejected: 'Rejected',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
