import {
  LoanStatus, InterestModel, TenureType, RepaymentType,
  ScheduleStatus, PaymentMethod, PermissionModule, PermissionAction,
} from '../enums';

// Generic API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItem: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

// Permission & User Group
export interface PermissionDto {
  module: PermissionModule;
  action: PermissionAction;
}

export interface UserGroupDto {
  id: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: PermissionDto[];
  createdAt: string;
}

// User
export interface UserDto {
  id: string;
  userId: string;
  email: string | null;
  name: string;
  isActive: boolean;
  userGroupId: string | null;
  userGroup: UserGroupDto | null;
  createdAt: string;
  updatedAt: string;
}

export type ActorType = 'USER' | 'LENDER';

export interface AuthUserDto {
  id: string;
  userId: string;
  email?: string | null;
  name: string;
  isActive: boolean;
  actorType: ActorType;
  userGroup: UserGroupDto | null;
}

// Lender (User with actorType === 'LENDER')
export interface LenderDto {
  id: string;
  userId: string;
  email: string | null;
  name: string;
  isActive: boolean;
  actorType: string;
  availableCapital: string;
  totalLent: string;
  createdAt: string;
  updatedAt: string;
}

// Customer
export interface CustomerDto {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Loan
export interface LoanDto {
  id: string;
  customerId: string;
  customer: Pick<CustomerDto, 'id' | 'fullName' | 'phone'>;
  lenderId: string;
  lender: { id: string; name: string };
  principal: string;
  interestRate: string;
  interestAmount: string;
  tenure: number;
  tenureType: TenureType;
  repaymentType: RepaymentType;
  interestModel: InterestModel;
  status: LoanStatus;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

// Repayment schedule row
export interface RepaymentScheduleDto {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  principalDue: string;
  interestDue: string;
  totalDue: string;
  paidAmount: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

// Payment event
export interface RepaymentDto {
  id: string;
  loanId: string;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  notes: string | null;
  createdAt: string;
}

// Allocation between a payment and a schedule row
export interface RepaymentAllocationDto {
  id: string;
  repaymentId: string;
  scheduleId: string;
  amountApplied: string;
  createdAt: string;
}

// Dashboard
export interface KpiData {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalOutstanding: string;
  overdueCount: number;
}

export interface MonthlyChartPoint {
  month: string;
  disbursed: number;
  repaid: number;
}

export interface StatusChartPoint {
  status: LoanStatus;
  count: number;
}

export interface OverdueTrendPoint {
  month: string;
  overdue: number;
}

export interface ChartData {
  monthly: MonthlyChartPoint[];
  statusBreakdown: StatusChartPoint[];
  overdueTrend: OverdueTrendPoint[];
}
