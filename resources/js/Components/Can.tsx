import { useRole } from '../hooks/useRole';
import type { Role } from '../types';

interface CanProps {
    roles: Role | Role[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function Can({ roles, fallback = null, children }: CanProps) {
    const { hasRole } = useRole();

    if (!hasRole(roles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
