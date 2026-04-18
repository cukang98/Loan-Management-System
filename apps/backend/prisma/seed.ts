import {
  PrismaClient,
  LoanStatus,
  TenureType,
  RepaymentType,
  InterestModel,
  ScheduleStatus,
  PaymentMethod,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Adds months while clamping to the last valid day (e.g. Jan 31 + 1 → Feb 28). */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < targetDay) d.setDate(0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

interface ScheduleItem {
  installmentNo: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
}

/** Generates a flat-interest installment schedule (equal principal + equal interest). */
function generateFlatInstallmentSchedule(
  principal: number,
  interestAmount: number,
  tenure: number,
  tenureType: TenureType,
  startDate: Date,
): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const principalPerPeriod = round(principal / tenure);
  const interestPerPeriod = round(interestAmount / tenure);

  for (let i = 1; i <= tenure; i++) {
    const isLast = i === tenure;
    const principalDue = isLast
      ? round(principal - principalPerPeriod * (tenure - 1))
      : principalPerPeriod;
    const interestDue = isLast
      ? round(interestAmount - interestPerPeriod * (tenure - 1))
      : interestPerPeriod;

    let dueDate: Date;
    switch (tenureType) {
      case TenureType.DAY:
        dueDate = addDays(startDate, i);
        break;
      case TenureType.WEEK:
        dueDate = addDays(startDate, i * 7);
        break;
      case TenureType.MONTH:
      default:
        dueDate = addMonths(startDate, i);
        break;
    }

    schedule.push({ installmentNo: i, dueDate, principalDue, interestDue, totalDue: round(principalDue + interestDue) });
  }

  return schedule;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in FK-safe order
  await prisma.repaymentAllocation.deleteMany();
  await prisma.repayment.deleteMany();
  await prisma.repaymentSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.userGroup.deleteMany();

  // ─── User groups ──────────────────────────────────────────────────────────
  const modules = ['loans', 'customers', 'lenders', 'repayments', 'users', 'user-groups'];

  const superAdminGroup = await prisma.userGroup.create({
    data: { name: 'Super Admin', isSuperAdmin: true },
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
      permissions: { create: modules.map((module) => ({ module, action: 'read' })) },
    },
  });

  console.log('✅ User groups created');

  // ─── Staff users ──────────────────────────────────────────────────────────
  const [passwordHash, staffHash, viewerHash] = await Promise.all([
    bcrypt.hash('Admin1234!', 12),
    bcrypt.hash('Staff1234!', 12),
    bcrypt.hash('View1234!', 12),
  ]);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@loanapp.com',
        userId: 'admin',
        password: passwordHash,
        name: 'System Administrator',
        actorType: 'USER',
        userGroupId: superAdminGroup.id,
      },
      {
        email: 'officer@loanapp.com',
        userId: 'officer',
        password: staffHash,
        name: 'Loan Officer',
        actorType: 'USER',
        userGroupId: loanOfficerGroup.id,
      },
      {
        email: 'viewer@loanapp.com',
        userId: 'viewer',
        password: viewerHash,
        name: 'Report Viewer',
        actorType: 'USER',
        userGroupId: viewerGroup.id,
      },
    ],
  });

  console.log('✅ Staff users created');

  // ─── Lenders ──────────────────────────────────────────────────────────────
  const lenderHash = await bcrypt.hash('Lender1234!', 12);

  const lenders = await Promise.all([
    prisma.user.create({
      data: { userId: 'capital_partners', password: lenderHash, name: 'Capital Partners Ltd', actorType: 'LENDER', availableCapital: 500000, totalLent: 0 },
    }),
    prisma.user.create({
      data: { userId: 'golden_finance', password: lenderHash, name: 'Golden Finance Group', actorType: 'LENDER', availableCapital: 250000, totalLent: 0 },
    }),
    prisma.user.create({
      data: { userId: 'sunrise_credit', password: lenderHash, name: 'Sunrise Credit Co.', actorType: 'LENDER', availableCapital: 150000, totalLent: 0 },
    }),
  ]);

  console.log('✅ Lenders created');

  // ─── Customers ────────────────────────────────────────────────────────────
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

  // ─── Loans ────────────────────────────────────────────────────────────────
  type LoanDef = {
    customer: number;
    lender: number;
    principal: number;
    interestRate: number;      // flat rate as % of principal
    tenure: number;
    tenureType: TenureType;
    repaymentType: RepaymentType;
    interestModel: InterestModel;
    status: LoanStatus;
    startDate: Date;
  };

  const loanDefs: LoanDef[] = [
    // Active loans
    { customer: 0, lender: 0, principal: 10000, interestRate: 10, tenure: 12, tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-06-01') },
    { customer: 1, lender: 0, principal: 25000, interestRate: 8,  tenure: 24, tenureType: TenureType.MONTH, repaymentType: RepaymentType.MONTHLY,     interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-07-01') },
    { customer: 2, lender: 1, principal: 5000,  interestRate: 5,  tenure: 30, tenureType: TenureType.DAY,   repaymentType: RepaymentType.DAILY,       interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-08-01') },
    { customer: 3, lender: 1, principal: 15000, interestRate: 6,  tenure: 18, tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.REDUCING, status: LoanStatus.ACTIVE,    startDate: new Date('2025-09-01') },
    { customer: 4, lender: 2, principal: 8000,  interestRate: 4,  tenure: 8,  tenureType: TenureType.WEEK,  repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-10-01') },
    { customer: 5, lender: 0, principal: 30000, interestRate: 9,  tenure: 36, tenureType: TenureType.MONTH, repaymentType: RepaymentType.ROLLING,     interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-11-01') },
    { customer: 6, lender: 2, principal: 12000, interestRate: 10, tenure: 12, tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2025-12-01') },
    { customer: 7, lender: 1, principal: 20000, interestRate: 7,  tenure: 24, tenureType: TenureType.MONTH, repaymentType: RepaymentType.MONTHLY,     interestModel: InterestModel.FLAT,     status: LoanStatus.ACTIVE,    startDate: new Date('2026-01-01') },
    // Completed loans
    { customer: 0, lender: 0, principal: 5000,  interestRate: 8,  tenure: 3,  tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.COMPLETED, startDate: new Date('2024-06-01') },
    { customer: 1, lender: 1, principal: 8000,  interestRate: 6,  tenure: 6,  tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.COMPLETED, startDate: new Date('2024-07-01') },
    { customer: 2, lender: 2, principal: 3000,  interestRate: 10, tenure: 3,  tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.COMPLETED, startDate: new Date('2024-09-01') },
    { customer: 8, lender: 0, principal: 10000, interestRate: 7,  tenure: 6,  tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.COMPLETED, startDate: new Date('2024-10-01') },
    { customer: 9, lender: 1, principal: 6000,  interestRate: 9,  tenure: 4,  tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.COMPLETED, startDate: new Date('2024-12-01') },
    // Defaulted loans
    { customer: 3, lender: 2, principal: 15000, interestRate: 12, tenure: 12, tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.FLAT,     status: LoanStatus.DEFAULTED, startDate: new Date('2024-01-01') },
    { customer: 4, lender: 0, principal: 20000, interestRate: 11, tenure: 18, tenureType: TenureType.MONTH, repaymentType: RepaymentType.INSTALLMENT, interestModel: InterestModel.REDUCING, status: LoanStatus.DEFAULTED, startDate: new Date('2024-03-01') },
  ];

  const createdLoans: { id: string; def: LoanDef }[] = [];

  for (const def of loanDefs) {
    const interestAmount = round(def.principal * def.interestRate / 100);
    const schedule = generateFlatInstallmentSchedule(
      def.principal,
      interestAmount,
      def.tenure,
      def.tenureType,
      def.startDate,
    );

    // For completed loans, mark all schedules PAID; defaulted → first 2 PAID, rest OVERDUE
    const scheduleStatuses: ScheduleStatus[] = schedule.map((_, i) => {
      if (def.status === LoanStatus.COMPLETED) return ScheduleStatus.PAID;
      if (def.status === LoanStatus.DEFAULTED) return i < 2 ? ScheduleStatus.PAID : ScheduleStatus.OVERDUE;
      return ScheduleStatus.PENDING;
    });

    const loan = await prisma.loan.create({
      data: {
        customerId: customers[def.customer].id,
        lenderId: lenders[def.lender].id,
        principal: def.principal,
        interestRate: def.interestRate,
        interestAmount,
        tenure: def.tenure,
        tenureType: def.tenureType,
        repaymentType: def.repaymentType,
        interestModel: def.interestModel,
        status: def.status,
        startDate: def.startDate,
        schedules: {
          create: schedule.map((item, i) => ({
            installmentNo: item.installmentNo,
            dueDate: item.dueDate,
            principalDue: item.principalDue,
            interestDue: item.interestDue,
            totalDue: item.totalDue,
            paidAmount: scheduleStatuses[i] === ScheduleStatus.PAID ? item.totalDue : 0,
            status: scheduleStatuses[i],
          })),
        },
      },
      include: { schedules: { orderBy: { installmentNo: 'asc' } } },
    });

    await prisma.user.update({
      where: { id: lenders[def.lender].id },
      data: { totalLent: { increment: def.principal } },
    });

    createdLoans.push({ id: loan.id, def });

    // Create repayment records for PAID schedules
    const paidSchedules = loan.schedules.filter((s) => s.status === ScheduleStatus.PAID);
    for (const sch of paidSchedules) {
      const repayment = await prisma.repayment.create({
        data: {
          loanId: loan.id,
          amount: Number(sch.totalDue),
          paymentDate: sch.dueDate,
          method: PaymentMethod.CASH,
        },
      });

      await prisma.repaymentAllocation.create({
        data: {
          repaymentId: repayment.id,
          scheduleId: sch.id,
          amountApplied: Number(sch.totalDue),
        },
      });
    }
  }

  console.log('✅ Loans and schedules created');

  // Active loans: seed a few partial repayments
  const activeLoans = createdLoans.filter((l) => l.def.status === LoanStatus.ACTIVE);
  for (const { id: loanId } of activeLoans.slice(0, 5)) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { schedules: { orderBy: { installmentNo: 'asc' }, take: 3 } },
    });
    if (!loan) continue;

    // Pay first 1-2 installments
    const numToPay = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < Math.min(numToPay, loan.schedules.length); i++) {
      const sch = loan.schedules[i];
      const repayment = await prisma.repayment.create({
        data: {
          loanId,
          amount: Number(sch.totalDue),
          paymentDate: sch.dueDate,
          method: PaymentMethod.CASH,
        },
      });

      await prisma.repaymentAllocation.create({
        data: {
          repaymentId: repayment.id,
          scheduleId: sch.id,
          amountApplied: Number(sch.totalDue),
        },
      });

      await prisma.repaymentSchedule.update({
        where: { id: sch.id },
        data: { paidAmount: Number(sch.totalDue), status: ScheduleStatus.PAID },
      });
    }
  }

  console.log('✅ Partial repayments seeded for active loans');
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
