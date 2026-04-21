"use client";

import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGuard;
