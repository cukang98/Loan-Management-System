import { LoanStatus, RepaymentFrequency, InterestModel, PermissionModule, PermissionAction } from '../enums';
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {
}
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
export interface UserDto {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    userGroupId: string | null;
    userGroup: UserGroupDto | null;
    createdAt: string;
    updatedAt: string;
}
export interface AuthUserDto {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    userGroup: UserGroupDto | null;
}
export interface LenderDto {
    id: string;
    name: string;
    availableCapital: string;
    totalLent: string;
    createdAt: string;
    updatedAt: string;
}
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
export interface LoanDto {
    id: string;
    customerId: string;
    customer: Pick<CustomerDto, 'id' | 'fullName' | 'phone'>;
    lenderId: string;
    lender: Pick<LenderDto, 'id' | 'name'>;
    principal: string;
    interestRate: string;
    tenureMonths: number;
    repaymentFrequency: RepaymentFrequency;
    interestModel: InterestModel;
    totalRepayment: string;
    installmentAmount: string;
    status: LoanStatus;
    startDate: string;
    createdAt: string;
    updatedAt: string;
}
export interface RepaymentDto {
    id: string;
    loanId: string;
    paidAmount: string;
    paidAt: string;
    remainingBalance: string;
    overdueDays: number;
    notes: string | null;
    createdAt: string;
}
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
