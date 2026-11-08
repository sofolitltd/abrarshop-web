import { db } from '@/lib/db';
import {
  parties,
  partyTransactions,
  purchases,
  purchaseItems,
  expenses,
  otherIncomes,
  cashTransactions,
  orders,
  orderItems,
  products,
} from '@/lib/schema';
import { eq, desc, sql, gte, lte, and, SQL } from 'drizzle-orm';
import type { Party, PartyTransaction, Purchase, Expense, OtherIncome, CashTransaction } from '@/lib/types';

export type DateRange = { from?: Date; to?: Date };

function dateFilter(column: any, range?: DateRange): SQL | undefined {
  const conditions = [];
  if (range?.from) conditions.push(gte(column, range.from));
  if (range?.to) conditions.push(lte(column, range.to));
  if (conditions.length === 0) return undefined;
  return and(...conditions);
}

export async function getParties(type: 'payable' | 'receivable'): Promise<Party[]> {
  const rows = await db.query.parties.findMany({
    where: eq(parties.type, type),
    orderBy: desc(parties.updatedAt),
  });
  return rows as Party[];
}

export async function getPartyById(id: string): Promise<Party | undefined> {
  const row = await db.query.parties.findFirst({ where: eq(parties.id, id) });
  return row as Party | undefined;
}

export async function getPartyTransactions(partyId: string): Promise<PartyTransaction[]> {
  const rows = await db.query.partyTransactions.findMany({
    where: eq(partyTransactions.partyId, partyId),
    orderBy: desc(partyTransactions.date),
  });
  return rows as PartyTransaction[];
}

export async function getPurchases(limit = 50): Promise<Purchase[]> {
  const rows = await db.query.purchases.findMany({
    orderBy: desc(purchases.date),
    limit,
    with: {
      supplier: true,
      items: { with: { product: true } },
    },
  });
  return rows.map((p: any) => ({
    ...p,
    supplierName: p.supplier?.name ?? null,
    items: p.items?.map((i: any) => ({ ...i, productName: i.product?.name })),
  })) as Purchase[];
}

export async function getPurchaseById(id: string): Promise<Purchase | undefined> {
  const row = await db.query.purchases.findFirst({
    where: eq(purchases.id, id),
    with: {
      supplier: true,
      items: { with: { product: true } },
    },
  });
  if (!row) return undefined;
  return {
    ...row,
    supplierName: (row as any).supplier?.name ?? null,
    items: (row as any).items?.map((i: any) => ({ ...i, productName: i.product?.name })),
  } as Purchase;
}

export async function getExpenses(limit = 50): Promise<Expense[]> {
  const rows = await db.query.expenses.findMany({ orderBy: desc(expenses.date), limit });
  return rows as Expense[];
}

export async function getOtherIncomes(limit = 50): Promise<OtherIncome[]> {
  const rows = await db.query.otherIncomes.findMany({ orderBy: desc(otherIncomes.date), limit });
  return rows as OtherIncome[];
}

export async function getCashTransactions(limit = 50): Promise<CashTransaction[]> {
  const rows = await db.query.cashTransactions.findMany({ orderBy: desc(cashTransactions.date), limit });
  return rows as CashTransaction[];
}

export async function getCashBalance(): Promise<number> {
  const [inRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(${cashTransactions.amount}), 0)` })
    .from(cashTransactions)
    .where(eq(cashTransactions.direction, 'in'));
  const [outRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(${cashTransactions.amount}), 0)` })
    .from(cashTransactions)
    .where(eq(cashTransactions.direction, 'out'));
  return Number(inRow?.total ?? 0) - Number(outRow?.total ?? 0);
}

export async function getSalesReport(range?: DateRange) {
  const where = dateFilter(orders.createdAt, range);
  const orderRows = await db.query.orders.findMany({
    where,
    orderBy: desc(orders.createdAt),
    with: { items: { with: { product: true } } },
  });

  let revenue = 0;
  let cost = 0;
  const salesRows = orderRows.map((o: any) => {
    const orderRevenue = Number(o.totalAmount);
    const orderCost = o.items.reduce(
      (sum: number, item: any) => sum + item.quantity * Number(item.product?.buyPrice ?? 0),
      0
    );
    revenue += orderRevenue;
    cost += orderCost;
    return {
      orderNumber: o.orderNumber,
      date: o.createdAt,
      revenue: orderRevenue,
      cost: orderCost,
      profit: orderRevenue - orderCost,
    };
  });

  return { rows: salesRows, totalRevenue: revenue, totalCost: cost, totalProfit: revenue - cost };
}

export async function getIncomeSummary(range?: DateRange) {
  const sales = await getSalesReport(range);

  const incomeWhere = dateFilter(otherIncomes.date, range);
  const otherIncomeRows = await db.query.otherIncomes.findMany({ where: incomeWhere });
  const totalOtherIncome = otherIncomeRows.reduce((sum, r) => sum + Number(r.amount), 0);

  const expenseWhere = dateFilter(expenses.date, range);
  const expenseRows = await db.query.expenses.findMany({ where: expenseWhere });
  const totalExpense = expenseRows.reduce((sum, r) => sum + Number(r.amount), 0);

  return {
    salesProfit: sales.totalProfit,
    totalOtherIncome,
    totalExpense,
    netIncome: sales.totalProfit + totalOtherIncome - totalExpense,
  };
}

export async function getAccountsOverview() {
  const [cashBalance, income, payableParties, receivableParties, purchaseList] = await Promise.all([
    getCashBalance(),
    getIncomeSummary(),
    getParties('payable'),
    getParties('receivable'),
    getPurchases(5),
  ]);

  const totalPayable = payableParties.reduce((sum, p) => sum + Number(p.currentBalance), 0);
  const totalReceivable = receivableParties.reduce((sum, p) => sum + Number(p.currentBalance), 0);
  const totalPurchase = purchaseList.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  return {
    cashBalance,
    income,
    totalPayable,
    totalReceivable,
    totalPurchase,
    recentPurchases: purchaseList,
  };
}
