export declare enum LoanStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    DEFAULTED = "DEFAULTED"
}
export declare enum RepaymentFrequency {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}
export declare enum InterestModel {
    FLAT = "FLAT",
    REDUCING = "REDUCING"
}
export declare enum PermissionModule {
    LOANS = "loans",
    CUSTOMERS = "customers",
    LENDERS = "lenders",
    REPAYMENTS = "repayments",
    USERS = "users",
    USER_GROUPS = "user-groups"
}
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete"
}
