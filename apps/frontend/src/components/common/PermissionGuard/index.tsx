'use client';

import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) return <>{fallback}</>;

  return <>{children}</>;
}
