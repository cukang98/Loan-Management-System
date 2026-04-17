"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionAction = exports.PermissionModule = exports.InterestModel = exports.RepaymentFrequency = exports.LoanStatus = void 0;
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["ACTIVE"] = "ACTIVE";
    LoanStatus["COMPLETED"] = "COMPLETED";
    LoanStatus["DEFAULTED"] = "DEFAULTED";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var RepaymentFrequency;
(function (RepaymentFrequency) {
    RepaymentFrequency["WEEKLY"] = "WEEKLY";
    RepaymentFrequency["BIWEEKLY"] = "BIWEEKLY";
    RepaymentFrequency["MONTHLY"] = "MONTHLY";
})(RepaymentFrequency || (exports.RepaymentFrequency = RepaymentFrequency = {}));
var InterestModel;
(function (InterestModel) {
    InterestModel["FLAT"] = "FLAT";
    InterestModel["REDUCING"] = "REDUCING";
})(InterestModel || (exports.InterestModel = InterestModel = {}));
var PermissionModule;
(function (PermissionModule) {
    PermissionModule["LOANS"] = "loans";
    PermissionModule["CUSTOMERS"] = "customers";
    PermissionModule["LENDERS"] = "lenders";
    PermissionModule["REPAYMENTS"] = "repayments";
    PermissionModule["USERS"] = "users";
    PermissionModule["USER_GROUPS"] = "user-groups";
})(PermissionModule || (exports.PermissionModule = PermissionModule = {}));
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
//# sourceMappingURL=index.js.map