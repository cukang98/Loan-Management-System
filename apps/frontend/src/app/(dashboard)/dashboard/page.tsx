'use client';

import { Row, Col, Card, Skeleton } from 'antd';
import {
  FileTextOutlined, CheckCircleOutlined, WarningOutlined,
  DollarOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { KPICard } from '@/components/common/KPICard';
import { PageHeader } from '@/components/common/PageHeader';
import { useDashboardKpis, useDashboardCharts } from '@/hooks/useDashboard';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#1677ff',
  COMPLETED: '#52c41a',
  DEFAULTED: '#ff4d4f',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  return (
    <div>
      <PageHeader title={t('title')} />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('totalLoans')} value={kpis?.totalLoans ?? 0} icon={<FileTextOutlined />} loading={kpisLoading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('activeLoans')} value={kpis?.activeLoans ?? 0} icon={<ClockCircleOutlined />} color="#1677ff" loading={kpisLoading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('totalOutstanding')} value={kpis ? `RM ${Number(kpis.totalOutstanding).toLocaleString()}` : '—'} icon={<DollarOutlined />} color="#722ed1" loading={kpisLoading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('overdueCount')} value={kpis?.overdueCount ?? 0} icon={<ExclamationCircleOutlined />} color="#ff4d4f" loading={kpisLoading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('completedLoans')} value={kpis?.completedLoans ?? 0} icon={<CheckCircleOutlined />} color="#52c41a" loading={kpisLoading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('defaultedLoans')} value={kpis?.defaultedLoans ?? 0} icon={<WarningOutlined />} color="#fa8c16" loading={kpisLoading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={t('monthlyChart')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `RM ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="disbursed" name={t('disbursed')} fill="#1677ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="repaid" name={t('repaid')} fill="#52c41a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('statusChart')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={charts?.statusBreakdown || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {charts?.statusBreakdown?.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={t('overdueTrend')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts?.overdueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="overdue" stroke="#ff4d4f" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
