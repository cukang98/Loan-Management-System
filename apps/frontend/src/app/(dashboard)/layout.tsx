import { AppLayout } from '@/components/layout/AppLayout';

const DashboardLayout: React.FC<{
  children: React.ReactNode;
}> = ({
  children,
}) => {
  return <AppLayout>{children}</AppLayout>;
};

export default DashboardLayout;
