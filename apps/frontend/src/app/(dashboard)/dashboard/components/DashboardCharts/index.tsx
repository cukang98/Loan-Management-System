
import { useTranslations } from 'next-intl';

// recharts
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// antd
import { Row, Col, Card, Skeleton } from 'antd';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#1677ff',
  COMPLETED: '#52c41a',
  DEFAULTED: '#ff4d4f',
};

interface DashboardChartsProps {
  charts: any;
  loading: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ charts, loading }) => {
  const t = useTranslations('dashboard');

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={t('monthlyChart')} style={{ borderRadius: 12 }}>
            {loading ? (
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
            {loading ? (
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
                    {charts?.statusBreakdown?.map((entry: any) => (
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
            {loading ? (
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
    </>
  );
}

export default DashboardCharts;
