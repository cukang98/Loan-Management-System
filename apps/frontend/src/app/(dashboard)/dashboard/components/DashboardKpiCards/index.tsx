import { useTranslations } from 'next-intl';

// antd
import { Row, Col } from 'antd';

// ant design icons
import {
  FileTextOutlined, CheckCircleOutlined, WarningOutlined,
  DollarOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';

// components
import { KPICard } from '@/components/common';

interface DashboardKpiCardsProps {
  kpis: any;
  loading: boolean;
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpis, loading }) => {
  const t = useTranslations('dashboard');

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('totalLoans')} value={kpis?.totalLoans ?? 0} icon={<FileTextOutlined />} loading={loading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('activeLoans')} value={kpis?.activeLoans ?? 0} icon={<ClockCircleOutlined />} color="#1677ff" loading={loading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('totalOutstanding')} value={kpis ? `RM ${Number(kpis.totalOutstanding).toLocaleString()}` : '—'} icon={<DollarOutlined />} color="#722ed1" loading={loading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('overdueCount')} value={kpis?.overdueCount ?? 0} icon={<ExclamationCircleOutlined />} color="#ff4d4f" loading={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('completedLoans')} value={kpis?.completedLoans ?? 0} icon={<CheckCircleOutlined />} color="#52c41a" loading={loading} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard title={t('defaultedLoans')} value={kpis?.defaultedLoans ?? 0} icon={<WarningOutlined />} color="#fa8c16" loading={loading} />
        </Col>
      </Row>
    </>
  );
}

export default DashboardKpiCards;
