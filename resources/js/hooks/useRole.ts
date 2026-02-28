import { usePage } from '@inertiajs/react';
import type { Role } from '../types';

export function useRole() {
    const { auth } = usePage().props as { auth: { user: { role: Role } | null } };
    
    const role = auth.user?.role;
    
    const isInvestor = role === 'investor';
    const isFarmOwner = role === 'farm_owner';
    const isAdmin = role === 'admin';
    
    const hasRole = (r: Role | Role[]): boolean => {
        if (!role) return false;
        if (Array.isArray(r)) {
            return r.includes(role);
        }
        return role === r;
    };

    return {
        role,
        isInvestor,
        isFarmOwner,
        isAdmin,
        hasRole,
    };
}
