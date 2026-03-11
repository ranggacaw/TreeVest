import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    treeId: number;
    isWishlisted: boolean;
    className?: string;
    /** If false, clicking does nothing (for unauthenticated users) */
    authenticated?: boolean;
}

export default function WishlistToggleButton({
    treeId,
    isWishlisted: initialWishlisted,
    className = '',
    authenticated = true,
}: Props) {
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [loading, setLoading] = useState(false);

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!authenticated) {
            router.visit(route('login'));
            return;
        }

        if (loading) return;
        setLoading(true);

        // Optimistic update
        setWishlisted(!wishlisted);

        router.post(
            route('investor.wishlist.toggle'),
            { type: 'tree', id: treeId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    // server confirms; keep our optimistic state
                    setLoading(false);
                },
                onError: () => {
                    // revert on error
                    setWishlisted(wishlisted);
                    setLoading(false);
                },
            },
        );
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 disabled:opacity-50 ${
                wishlisted
                    ? 'text-rose-500 hover:text-rose-600 bg-white/90 hover:bg-white'
                    : 'text-gray-400 hover:text-rose-500 bg-white/80 hover:bg-white'
            } ${className}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={wishlisted ? 0 : 2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
