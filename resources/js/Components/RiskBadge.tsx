export default function RiskBadge({ rating, className = '' }: { rating: string, className?: string }) {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (rating === 'low') {
        colorClass = 'bg-green-100 text-green-800';
    } else if (rating === 'medium') {
        colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (rating === 'high') {
        colorClass = 'bg-red-100 text-red-800';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass} ${className}`}>
            {rating} Risk
        </span>
    );
}
