'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  parties,
  partyTransactions,
  purchases,
  purchaseItems,
  expenses,
  otherIncomes,
  cashTransactions,
  products,
} from '@/lib/schema';
import { eq, sql, and, ilike } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ---------- Parties (দেনা/পাওনা) ----------

const partyFormSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।'),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['payable', 'receivable']),
  notes: z.string().optional(),
});

export async function createParty(data: unknown) {
  const validated = partyFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  try {
    const [party] = await db
      .insert(parties)
      .values({ id: createId(), ...validated.data, currentBalance: '0' })
      .returning();
    revalidatePath('/admin/accounts/due');
    return { success: true, party };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}

const quickSaleDueSchema = z.object({
  customerName: z.string().min(1, 'কাস্টমারের নাম আবশ্যক।'),
  customerPhone: z.string().min(1, 'ফোন নাম্বার আবশ্যক।'),
  amount: z.coerce.number().positive('বাকির পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  relatedOrderId: z.string().optional(),
});

// Used by Quick Sale: when a customer doesn't pay in full, find-or-create a
// receivable party by name and add the unpaid amount as a due on their ledger.
// When relatedOrderId is given, this due is auto-reversed/removed if that order is deleted.
export async function recordQuickSaleDue(data: unknown) {
  const validated = quickSaleDueSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: validated.error.flatten().fieldErrors.customerName?.[0] || 'তথ্য সঠিক নয়।' };
  }
  const { customerName, customerPhone, amount, note, relatedOrderId } = validated.data;

  try {
    const partyName = await db.transaction(async (tx) => {
      // Match on name + phone together, so two different people with the same
      // first name don't get merged into one ledger.
      let party = await tx.query.parties.findFirst({
        where: and(
          eq(parties.type, 'receivable'),
          ilike(parties.name, customerName.trim()),
          eq(parties.phone, customerPhone.trim())
        ),
      });

      if (!party) {
        const [created] = await tx
          .insert(parties)
          .values({
            id: createId(),
            name: customerName.trim(),
            phone: customerPhone.trim(),
            type: 'receivable',
            currentBalance: '0',
          })
          .returning();
        party = created;
      }

      await tx
        .update(parties)
        .set({ currentBalance: sql`${parties.currentBalance} + ${amount}`, updatedAt: new Date() })
        .where(eq(parties.id, party.id));

      await tx.insert(partyTransactions).values({
        id: createId(),
        partyId: party.id,
        type: 'due',
        amount: String(amount),
        note: note || 'দ্রুত বিক্রয় - আংশিক পরিশোধ',
        relatedOrderId: relatedOrderId || null,
      });

      return party.name;
    });

    revalidatePath('/admin/accounts/due');
    revalidatePath('/admin/accounts');
    return { success: true, partyName };
  } catch (error: any) {
    return { success: false, message: error.message || 'বাকি যুক্ত করা যায়নি।' };
  }
}

const partyTransactionFormSchema = z.object({
  partyId: z.string().min(1),
  type: z.enum(['due', 'payment']),
  amount: z.coerce.number().positive('পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});

// For a 'payable' party: 'due' increases what we owe them, 'payment' is us paying them (cash out).
// For a 'receivable' party: 'due' increases what they owe us, 'payment' is them paying us (cash in).
export async function createPartyTransaction(data: unknown) {
  const validated = partyTransactionFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  const { partyId, type, amount, note, date } = validated.data;

  try {
    await db.transaction(async (tx) => {
      const party = await tx.query.parties.findFirst({ where: eq(parties.id, partyId) });
      if (!party) throw new Error('পার্টি খুঁজে পাওয়া যায়নি।');

      const balanceDelta = type === 'due' ? amount : -amount;

      await tx
        .update(parties)
        .set({ currentBalance: sql`${parties.currentBalance} + ${balanceDelta}`, updatedAt: new Date() })
        .where(eq(parties.id, partyId));

      await tx.insert(partyTransactions).values({
        id: createId(),
        partyId,
        type,
        amount: String(amount),
        note,
        date: date ?? new Date(),
      });

      if (type === 'payment') {
        const direction = party.type === 'payable' ? 'out' : 'in';
        const category = party.type === 'payable' ? 'payable_payment' : 'receivable_collection';
        await tx.insert(cashTransactions).values({
          id: createId(),
          direction,
          amount: String(amount),
          category,
          relatedPartyId: partyId,
          note: note ?? `${party.name}-এর সাথে লেনদেন`,
          date: date ?? new Date(),
        });
      }
    });

    revalidatePath('/admin/accounts/due');
    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'লেনদেন সম্পন্ন করা যায়নি।' };
  }
}

export async function deleteParty(id: string) {
  try {
    await db.delete(parties).where(eq(parties.id, id));
    revalidatePath('/admin/accounts/due');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}

// ---------- Purchases (ক্রয়) ----------

const purchaseItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  buyPrice: z.coerce.number().min(0),
});

const purchaseFormSchema = z.object({
  supplierId: z.string().optional().nullable(),
  invoiceNo: z.string().optional(),
  paidAmount: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
  items: z.array(purchaseItemSchema).min(1, 'কমপক্ষে একটি পণ্য যুক্ত করুন।'),
});

export async function createPurchase(data: unknown) {
  const validated = purchaseFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  const { supplierId, invoiceNo, paidAmount, note, date, items } = validated.data;

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.buyPrice, 0);
  const dueAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatus = dueAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due';
  const purchaseDate = date ?? new Date();

  try {
    const purchaseId = createId();

    await db.transaction(async (tx) => {
      await tx.insert(purchases).values({
        id: purchaseId,
        supplierId: supplierId || null,
        invoiceNo,
        totalAmount: String(totalAmount),
        paidAmount: String(paidAmount),
        dueAmount: String(dueAmount),
        paymentStatus,
        note,
        date: purchaseDate,
      });

      for (const item of items) {
        const subtotal = item.quantity * item.buyPrice;
        await tx.insert(purchaseItems).values({
          id: createId(),
          purchaseId,
          productId: item.productId,
          quantity: item.quantity,
          buyPrice: String(item.buyPrice),
          subtotal: String(subtotal),
        });

        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            buyPrice: String(item.buyPrice),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }

      if (paidAmount > 0) {
        await tx.insert(cashTransactions).values({
          id: createId(),
          direction: 'out',
          amount: String(paidAmount),
          category: 'purchase_payment',
          relatedPartyId: supplierId || null,
          relatedPurchaseId: purchaseId,
          note: invoiceNo ? `ক্রয় (ইনভয়েস: ${invoiceNo})` : 'ক্রয়ের টাকা পরিশোধ',
          date: purchaseDate,
        });
      }

      if (dueAmount > 0 && supplierId) {
        const supplier = await tx.query.parties.findFirst({ where: eq(parties.id, supplierId) });
        if (supplier) {
          await tx
            .update(parties)
            .set({ currentBalance: sql`${parties.currentBalance} + ${dueAmount}`, updatedAt: new Date() })
            .where(eq(parties.id, supplierId));

          await tx.insert(partyTransactions).values({
            id: createId(),
            partyId: supplierId,
            type: 'due',
            amount: String(dueAmount),
            note: invoiceNo ? `ক্রয় (ইনভয়েস: ${invoiceNo})` : 'ক্রয় বাকি',
            date: purchaseDate,
          });
        }
      }
    });

    revalidatePath('/admin/accounts/purchase');
    revalidatePath('/admin/accounts/due');
    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/products');
    return { success: true, purchaseId };
  } catch (error: any) {
    return { success: false, message: error.message || 'ক্রয় এন্ট্রি করা যায়নি।' };
  }
}

// ---------- Expenses (খরচ) ----------

const expenseFormSchema = z.object({
  title: z.string().min(2, 'শিরোনাম আবশ্যক।'),
  category: z.string().default('other'),
  amount: z.coerce.number().positive('পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});

export async function createExpense(data: unknown) {
  const validated = expenseFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  const { title, category, amount, note, date } = validated.data;
  const expenseDate = date ?? new Date();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(expenses).values({
        id: createId(),
        title,
        category,
        amount: String(amount),
        note,
        date: expenseDate,
      });
      await tx.insert(cashTransactions).values({
        id: createId(),
        direction: 'out',
        amount: String(amount),
        category: 'expense',
        note: title,
        date: expenseDate,
      });
    });

    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts/income');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'খরচ যোগ করা যায়নি।' };
  }
}

// ---------- Other income (অন্য আয়) ----------

const otherIncomeFormSchema = z.object({
  title: z.string().min(2, 'শিরোনাম আবশ্যক।'),
  category: z.string().default('other'),
  amount: z.coerce.number().positive('পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});

export async function createOtherIncome(data: unknown) {
  const validated = otherIncomeFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  const { title, category, amount, note, date } = validated.data;
  const incomeDate = date ?? new Date();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(otherIncomes).values({
        id: createId(),
        title,
        category,
        amount: String(amount),
        note,
        date: incomeDate,
      });
      await tx.insert(cashTransactions).values({
        id: createId(),
        direction: 'in',
        amount: String(amount),
        category: 'other_income',
        note: title,
        date: incomeDate,
      });
    });

    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts/income');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'আয় যোগ করা যায়নি।' };
  }
}

const quickSaleCashReceiptSchema = z.object({
  amount: z.coerce.number().positive('পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  relatedOrderId: z.string().optional(),
});

// Used by Quick Sale: records the cash (or bKash/Nagad) actually collected
// at the time of sale, separately from any unpaid amount sent to a party's due.
// When relatedOrderId is given, this entry is auto-removed if that order is deleted.
export async function recordQuickSaleCashReceipt(data: unknown) {
  const validated = quickSaleCashReceiptSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: 'তথ্য সঠিক নয়।' };
  }
  const { amount, note, relatedOrderId } = validated.data;

  try {
    await db.insert(cashTransactions).values({
      id: createId(),
      direction: 'in',
      amount: String(amount),
      category: 'sale',
      note,
      relatedOrderId: relatedOrderId || null,
      date: new Date(),
    });
    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'ক্যাশ এন্ট্রি করা যায়নি।' };
  }
}

// ---------- Cash (ক্যাশ) manual adjustment ----------

const cashTransactionFormSchema = z.object({
  direction: z.enum(['in', 'out']),
  amount: z.coerce.number().positive('পরিমাণ শূন্যের বেশি হতে হবে।'),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});

export async function createCashTransaction(data: unknown) {
  const validated = cashTransactionFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors, message: 'তথ্য সঠিক নয়।' };
  }
  const { direction, amount, note, date } = validated.data;

  try {
    await db.insert(cashTransactions).values({
      id: createId(),
      direction,
      amount: String(amount),
      category: 'adjustment',
      note,
      date: date ?? new Date(),
    });
    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}

export async function deleteCashTransaction(id: string) {
  try {
    await db.delete(cashTransactions).where(eq(cashTransactions.id, id));
    revalidatePath('/admin/accounts/cash');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}
