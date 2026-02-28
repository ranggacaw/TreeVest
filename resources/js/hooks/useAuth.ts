import { usePage } from '@inertiajs/react';
import type { User } from '../types';

export function useAuth() {
    const { auth } = usePage().props as { auth: { user: User | null } };
    
    const user = auth.user;
    const isAuthenticated = user !== null;

    return {
        user,
        isAuthenticated,
    };
}
