import { useQuery } from '@tanstack/react-query';

import { dashboardKeys, getDashboardKpis, getDashboardCharts } from '@/services/dashboard.api';

export const useDashboardKpis = () =>
  useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: getDashboardKpis,
  });

export const useDashboardCharts = () =>
  useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: getDashboardCharts,
  });
