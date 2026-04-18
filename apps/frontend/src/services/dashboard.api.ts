import { GET } from '@/lib/request';

import type { KpiData, ChartData } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const dashboardKeys = {
  all: ['dashboard'],
  kpis: () => [...dashboardKeys.all, 'kpis'],
  charts: () => [...dashboardKeys.all, 'charts'],
};

// ---------- Service Functions ----------

export const getDashboardKpis = (): Promise<KpiData> =>
  GET<KpiData>('/dashboard/kpis');

export const getDashboardCharts = (): Promise<ChartData> =>
  GET<ChartData>('/dashboard/charts');
