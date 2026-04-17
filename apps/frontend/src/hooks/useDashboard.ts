import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { KpiData, ChartData } from '@ck-loan/shared';

export const useDashboardKpis = () =>
  useQuery<KpiData>({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const res = await api.get('/dashboard/kpis');
      return res.data.data;
    },
  });

export const useDashboardCharts = () =>
  useQuery<ChartData>({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      const res = await api.get('/dashboard/charts');
      return res.data.data;
    },
  });
