"use client";

import { useTranslations } from "next-intl";

// hooks
import DashboardCharts from "./components/DashboardCharts";
import DashboardKpiCards from "./components/DashboardKpiCards";
import { useDashboardKpis, useDashboardCharts } from "@/hooks/useDashboard";

// components
import { PageHeader } from "@/components/common";

const DashboardPage: React.FC = () => {
  const t = useTranslations("dashboard");
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  return (
    <div>
      <PageHeader title={t("title")} />

      <DashboardKpiCards kpis={kpis} loading={kpisLoading} />

      <DashboardCharts charts={charts} loading={chartsLoading} />
    </div>
  );
};

export default DashboardPage;
