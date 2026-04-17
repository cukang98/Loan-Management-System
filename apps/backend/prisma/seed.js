"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    await prisma.repayment.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.lender.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.userGroup.deleteMany();
    const modules = ['loans', 'customers', 'lenders', 'repayments', 'users', 'user-groups'];
    const superAdminGroup = await prisma.userGroup.create({
        data: {
            name: 'Super Admin',
            isSuperAdmin: true,
        },
    });
    const loanOfficerGroup = await prisma.userGroup.create({
        data: {
            name: 'Loan Officer',
            isSuperAdmin: false,
            permissions: {
                create: [
                    { module: 'loans', action: 'create' },
                    { module: 'loans', action: 'read' },
                    { module: 'loans', action: 'update' },
                    { module: 'customers', action: 'create' },
                    { module: 'customers', action: 'read' },
                    { module: 'customers', action: 'update' },
                    { module: 'repayments', action: 'create' },
                    { module: 'repayments', action: 'read' },
                    { module: 'lenders', action: 'read' },
                ],
            },
        },
    });
    const viewerGroup = await prisma.userGroup.create({
        data: {
            name: 'Viewer',
            isSuperAdmin: false,
            permissions: {
                create: modules.map((module) => ({ module, action: 'read' })),
            },
        },
    });
    console.log('✅ User groups created');
    const passwordHash = await bcrypt.hash('Admin1234!', 12);
    const staffHash = await bcrypt.hash('Staff1234!', 12);
    const viewerHash = await bcrypt.hash('View1234!', 12);
    await prisma.user.createMany({
        data: [
            {
                email: 'admin@loanapp.com',
                password: passwordHash,
                name: 'System Administrator',
                userGroupId: superAdminGroup.id,
            },
            {
                email: 'officer@loanapp.com',
                password: staffHash,
                name: 'Loan Officer',
                userGroupId: loanOfficerGroup.id,
            },
            {
                email: 'viewer@loanapp.com',
                password: viewerHash,
                name: 'Report Viewer',
                userGroupId: viewerGroup.id,
            },
        ],
    });
    console.log('✅ Users created');
    const lenders = await Promise.all([
        prisma.lender.create({
            data: { name: 'Capital Partners Ltd', availableCapital: 500000, totalLent: 0 },
        }),
        prisma.lender.create({
            data: { name: 'Golden Finance Group', availableCapital: 250000, totalLent: 0 },
        }),
        prisma.lender.create({
            data: { name: 'Sunrise Credit Co.', availableCapital: 150000, totalLent: 0 },
        }),
    ]);
    console.log('✅ Lenders created');
    const customers = await Promise.all([
        prisma.customer.create({ data: { fullName: 'Zhang Wei', phone: '012-3456789', email: 'zhang.wei@email.com', address: 'Kuala Lumpur' } }),
        prisma.customer.create({ data: { fullName: 'Lim Mei Ling', phone: '011-2345678', email: 'lim.mei@email.com', address: 'Penang' } }),
        prisma.customer.create({ data: { fullName: 'Ahmad Razif', phone: '017-8901234', address: 'Johor Bahru' } }),
        prisma.customer.create({ data: { fullName: 'Priya Nair', phone: '016-7890123', email: 'priya.n@email.com', address: 'Ipoh' } }),
        prisma.customer.create({ data: { fullName: 'Tan Chee Keong', phone: '019-6789012', address: 'Selangor' } }),
        prisma.customer.create({ data: { fullName: 'Nurul Aisyah', phone: '013-5678901', email: 'nurul.a@email.com', address: 'Kuala Lumpur' } }),
        prisma.customer.create({ data: { fullName: 'Wong Jia Hui', phone: '014-4567890', address: 'Kota Kinabalu' } }),
        prisma.customer.create({ data: { fullName: 'Ravi Kumar', phone: '018-3456789', email: 'ravi.k@email.com', address: 'Petaling Jaya' } }),
        prisma.customer.create({ data: { fullName: 'Siti Zaleha', phone: '010-2345678', address: 'Shah Alam' } }),
        prisma.customer.create({ data: { fullName: 'Liang Qing', phone: '015-1234567', email: 'liang.q@email.com', address: 'Melaka' } }),
    ]);
    console.log('✅ Customers created');
    function calcFlat(principal, rate, tenureMonths, freq) {
        const interest = principal * (rate / 100) * (tenureMonths / 12);
        const total = principal + interest;
        const installments = freq === 'WEEKLY' ? tenureMonths * 4 : freq === 'BIWEEKLY' ? tenureMonths * 2 : tenureMonths;
        return { totalRepayment: total, installmentAmount: total / installments };
    }
    function calcReducing(principal, rate, tenureMonths, freq) {
        const monthlyRate = rate / 100 / 12;
        const installment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
        const freqMultiplier = freq === 'WEEKLY' ? 4 : freq === 'BIWEEKLY' ? 2 : 1;
        const perPeriodInstallment = installment / freqMultiplier;
        const numInstallments = tenureMonths * freqMultiplier;
        return { totalRepayment: perPeriodInstallment * numInstallments, installmentAmount: perPeriodInstallment };
    }
    const loanDefs = [
        { customer: 0, lender: 0, principal: 10000, rate: 8, tenure: 12, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-06-01') },
        { customer: 1, lender: 0, principal: 25000, rate: 6.5, tenure: 24, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-07-01') },
        { customer: 2, lender: 1, principal: 5000, rate: 10, tenure: 6, freq: client_1.RepaymentFrequency.WEEKLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-08-01') },
        { customer: 3, lender: 1, principal: 15000, rate: 7, tenure: 18, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-09-01') },
        { customer: 4, lender: 2, principal: 8000, rate: 9, tenure: 12, freq: client_1.RepaymentFrequency.BIWEEKLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-10-01') },
        { customer: 5, lender: 0, principal: 30000, rate: 5.5, tenure: 36, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-11-01') },
        { customer: 6, lender: 2, principal: 12000, rate: 8.5, tenure: 12, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2025-12-01') },
        { customer: 7, lender: 1, principal: 20000, rate: 7.5, tenure: 24, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.ACTIVE, startDate: new Date('2026-01-01') },
        { customer: 0, lender: 0, principal: 5000, rate: 8, tenure: 3, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.COMPLETED, startDate: new Date('2024-06-01') },
        { customer: 1, lender: 1, principal: 8000, rate: 6, tenure: 6, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.COMPLETED, startDate: new Date('2024-07-01') },
        { customer: 2, lender: 2, principal: 3000, rate: 10, tenure: 3, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.COMPLETED, startDate: new Date('2024-09-01') },
        { customer: 8, lender: 0, principal: 10000, rate: 7, tenure: 6, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.COMPLETED, startDate: new Date('2024-10-01') },
        { customer: 9, lender: 1, principal: 6000, rate: 9, tenure: 4, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.COMPLETED, startDate: new Date('2024-12-01') },
        { customer: 3, lender: 2, principal: 15000, rate: 12, tenure: 12, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.FLAT, status: client_1.LoanStatus.DEFAULTED, startDate: new Date('2024-01-01') },
        { customer: 4, lender: 0, principal: 20000, rate: 11, tenure: 18, freq: client_1.RepaymentFrequency.MONTHLY, model: client_1.InterestModel.REDUCING, status: client_1.LoanStatus.DEFAULTED, startDate: new Date('2024-03-01') },
    ];
    const createdLoans = [];
    for (const def of loanDefs) {
        const calc = def.model === client_1.InterestModel.FLAT
            ? calcFlat(def.principal, def.rate, def.tenure, def.freq)
            : calcReducing(def.principal, def.rate, def.tenure, def.freq);
        const loan = await prisma.loan.create({
            data: {
                customerId: customers[def.customer].id,
                lenderId: lenders[def.lender].id,
                principal: def.principal,
                interestRate: def.rate,
                tenureMonths: def.tenure,
                repaymentFrequency: def.freq,
                interestModel: def.model,
                totalRepayment: Math.round(calc.totalRepayment * 100) / 100,
                installmentAmount: Math.round(calc.installmentAmount * 100) / 100,
                status: def.status,
                startDate: def.startDate,
            },
        });
        createdLoans.push(loan);
        await prisma.lender.update({
            where: { id: lenders[def.lender].id },
            data: { totalLent: { increment: def.principal } },
        });
    }
    console.log('✅ Loans created');
    const now = new Date();
    for (let i = 0; i < 8; i++) {
        const loan = createdLoans[i];
        const installment = parseFloat(loan.installmentAmount.toString());
        let remaining = parseFloat(loan.totalRepayment.toString());
        const numRepayments = Math.min(3, Math.floor(Math.random() * 4) + 1);
        for (let j = 0; j < numRepayments; j++) {
            remaining -= installment;
            const paidAt = new Date(loan.startDate);
            paidAt.setMonth(paidAt.getMonth() + j + 1);
            const isOverdue = paidAt < now && Math.random() > 0.6;
            const overdueDays = isOverdue ? Math.floor(Math.random() * 45) + 1 : 0;
            await prisma.repayment.create({
                data: {
                    loanId: loan.id,
                    paidAmount: Math.round(installment * 100) / 100,
                    paidAt,
                    remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
                    overdueDays,
                },
            });
        }
    }
    for (let i = 8; i < 13; i++) {
        const loan = createdLoans[i];
        const installment = parseFloat(loan.installmentAmount.toString());
        let remaining = parseFloat(loan.totalRepayment.toString());
        const numInstallments = loan.tenureMonths;
        for (let j = 0; j < numInstallments; j++) {
            remaining -= installment;
            const paidAt = new Date(loan.startDate);
            paidAt.setMonth(paidAt.getMonth() + j + 1);
            await prisma.repayment.create({
                data: {
                    loanId: loan.id,
                    paidAmount: Math.round(installment * 100) / 100,
                    paidAt,
                    remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
                    overdueDays: 0,
                },
            });
        }
    }
    for (let i = 13; i < 15; i++) {
        const loan = createdLoans[i];
        const installment = parseFloat(loan.installmentAmount.toString());
        let remaining = parseFloat(loan.totalRepayment.toString());
        for (let j = 0; j < 2; j++) {
            remaining -= installment;
            const paidAt = new Date(loan.startDate);
            paidAt.setMonth(paidAt.getMonth() + j + 1);
            await prisma.repayment.create({
                data: {
                    loanId: loan.id,
                    paidAmount: Math.round(installment * 100) / 100,
                    paidAt,
                    remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
                    overdueDays: 90 + j * 30,
                },
            });
        }
    }
    console.log('✅ Repayments created');
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map