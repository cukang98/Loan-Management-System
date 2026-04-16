export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
}

export enum RepaymentFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum InterestModel {
  FLAT = 'FLAT',
  REDUCING = 'REDUCING',
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
