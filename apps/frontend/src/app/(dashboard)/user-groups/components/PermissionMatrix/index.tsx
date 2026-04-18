import { Checkbox, Table } from 'antd';
import { PermissionModule, PermissionAction } from '@ck-loan/shared';

const MODULES = Object.values(PermissionModule);
const ACTIONS = Object.values(PermissionAction);

const MODULE_LABELS: Record<string, string> = {
  loans: '贷款', customers: '客户', lenders: '贷款方',
  repayments: '还款', users: '用户', 'user-groups': '用户组',
};
const ACTION_LABELS: Record<string, string> = {
  create: '创建', read: '查看', update: '编辑', delete: '删除',
};

interface PermissionMatrixProps {
  value?: string[];
  onChange?: (v: string[]) => void;
}

export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  const current = value || [];

  const toggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    onChange?.(next);
  };

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={MODULES.map((m) => ({ module: m, key: m }))}
      columns={[
        {
          title: '模块',
          dataIndex: 'module',
          key: 'module',
          render: (m: string) => MODULE_LABELS[m] ?? m,
        },
        ...ACTIONS.map((action) => ({
          title: ACTION_LABELS[action] ?? action,
          key: action,
          render: (_: unknown, row: { module: string }) => (
            <Checkbox
              checked={current.includes(`${row.module}:${action}`)}
              onChange={() => toggle(row.module, action)}
            />
          ),
        })),
      ]}
    />
  );
}
