import { useState } from 'react';

// antd
import { DatePicker, Flex, Form, InputNumber, Radio, Select, FormInstance } from 'antd';

// shared
import { InterestModel, TenureType, RepaymentType } from '@ck-loan/shared';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { FormModal } from '@/components/common';

// hooks
import { useCustomers } from "@/hooks/useCustomers";
import { useLenders } from "@/hooks/useLenders";
import { useCreateLoan } from "@/hooks/useLoans";

interface Props {
  open: boolean;
  form: FormInstance;
  onClose: () => void;
}

const LoanFormModal: React.FC<Props> = ({ open, form, onClose }) => {
  const createMutation = useCreateLoan();

  const { data: customers } = useCustomers({ pageSize: 100 });
  const { data: lenders } = useLenders({ pageSize: 100 });

  const t = useTranslations('loans');
  const [interestMode, setInterestMode] = useState<'rate' | 'amount'>('rate');

  const handleClose = () => {
    onClose();
    setInterestMode('rate');
  };

  const handleModeChange = (e: any) => {
    setInterestMode(e.target.value);
    form.resetFields(['interestRate', 'interestAmount']);
  };


  const handleSubmit = async (values: any, interestMode: 'rate' | 'amount') => {
    const payload: any = {
      customerId: values.customerId,
      lenderId: values.lenderId,
      principal: values.principal,
      tenure: values.tenure,
      tenureType: values.tenureType,
      repaymentType: values.repaymentType,
      interestModel: values.interestModel,
      startDate: values.startDate.format('YYYY-MM-DD'),
    };
    if (interestMode === 'rate') {
      payload.interestRate = values.interestRate;
    } else {
      payload.interestAmount = values.interestAmount;
    }
    await createMutation.mutateAsync(payload);
    onClose();
    form.resetFields();
  };
  return (
    <FormModal
      open={open}
      title={t('addLoan')}
      form={form}
      onClose={handleClose}
      onSubmit={(values) => handleSubmit(values, interestMode)}
      loading={createMutation.isPending}
      width={640}
    >
      <Form.Item name="customerId" label={t('customer')} rules={[{ required: true }]}>
        <Select showSearch optionFilterProp="label"
          options={customers?.items.map((c: any) => ({ label: c.fullName, value: c.id }))} />
      </Form.Item>

      <Form.Item name="lenderId" label={t('lender')} rules={[{ required: true }]}>
        <Select showSearch optionFilterProp="label"
          options={lenders?.items.map((l: any) => ({
            label: `${l.name} (RM ${Number(l.availableCapital).toLocaleString()})`,
            value: l.id,
          }))} />
      </Form.Item>

      <Form.Item name="principal" label={t('principal')} rules={[{ required: true }]}>
        <InputNumber style={{ width: '100%' }} min={1} prefix="RM" />
      </Form.Item>

      <Flex gap={8}>
        <Form.Item name="tenure" label={t('tenure')} rules={[{ required: true }]} style={{ flex: 1 }}>
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item name="tenureType" label={t('tenureType')} rules={[{ required: true }]} style={{ width: 120 }}>
          <Select options={[
            { label: t('tenureDay'), value: TenureType.DAY },
            { label: t('tenureWeek'), value: TenureType.WEEK },
            { label: t('tenureMonth'), value: TenureType.MONTH },
          ]} />
        </Form.Item>
      </Flex>

      <Form.Item name="repaymentType" label={t('repaymentType')} rules={[{ required: true }]}>
        <Select options={[
          { label: t('typeInstallment'), value: RepaymentType.INSTALLMENT },
          { label: t('typeDaily'), value: RepaymentType.DAILY },
          { label: t('typeMonthly'), value: RepaymentType.MONTHLY },
          { label: t('typeRolling'), value: RepaymentType.ROLLING },
        ]} />
      </Form.Item>

      <Form.Item name="interestModel" label={t('interestModel')}>
        <Select allowClear placeholder="Default: FLAT" options={[
          { label: t('modelFlat'), value: InterestModel.FLAT },
          { label: t('modelReducing'), value: InterestModel.REDUCING },
        ]} />
      </Form.Item>

      <Form.Item label={t('interestInput')}>
        <Radio.Group
          value={interestMode}
          onChange={handleModeChange}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="rate">{t('interestByRate')}</Radio.Button>

          <Radio.Button value="amount">{t('interestByAmount')}</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {interestMode === 'rate' ? (
        <Form.Item name="interestRate" label={t('interestRate')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} max={100} step={0.1} suffix="%" />
        </Form.Item>
      ) : (
        <Form.Item name="interestAmount" label={t('interestAmount')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} step={1} prefix="RM" />
        </Form.Item>
      )}

      <Form.Item name="startDate" label={t('startDate')} rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </FormModal>
  );
}

export default LoanFormModal;