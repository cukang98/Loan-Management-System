export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
}

export enum TenureType {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum RepaymentType {
  INSTALLMENT = 'INSTALLMENT',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  ROLLING = 'ROLLING',
}

export enum InterestModel {
  FLAT = 'FLAT',
  REDUCING = 'REDUCING',
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  OTHER = 'OTHER',
}

export enum PermissionModule {
  LOANS = 'loans',
  CUSTOMERS = 'customers',
  LENDERS = 'lenders',
  REPAYMENTS = 'repayments',
  USERS = 'users',
  USER_GROUPS = 'user-groups',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
