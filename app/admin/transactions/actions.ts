"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendFormResponseInvoiceEmail } from "@/lib/mailer";

export interface TransactionItem {
  id: string;
  formId: string;
  formTitle: string;
  receiptNumber: string;
  transactionId: string | null;
  paymentStatus: string;
  paymentAmount: number;
  recipientName: string;
  recipientEmail: string;
  answers: Record<string, unknown>;
  createdAt: string;
  verifiedAt: string | null;
  hasFormPaymentField: boolean;
  isValidTransaction: boolean;
  isFakeOrSuspicious: boolean;
}

export interface PaymentFormOption {
  formId: string;
  title: string;
  paymentAmount: number;
}

function extractName(answers: Record<string, unknown>): string {
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val === "string" && (key.toLowerCase().includes("name") || key.toLowerCase().includes("full"))) {
      return val;
    }
  }
  return "Participant";
}

function extractEmail(answers: Record<string, unknown>): string {
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val === "string" && key.toLowerCase().includes("email")) {
      return val;
    }
  }
  return "N/A";
}

function hasFormPaymentField(definitionJson: unknown): boolean {
  try {
    const def = typeof definitionJson === "string" ? JSON.parse(definitionJson) : definitionJson;
    if (def && Array.isArray(def.sections)) {
      for (const sec of def.sections) {
        if (Array.isArray(sec.fields)) {
          for (const f of sec.fields) {
            if (f.type === "payment") {
              return true;
            }
          }
        }
      }
    }
  } catch {
    // fallback
  }
  return false;
}

function extractPaymentAmount(definitionJson: unknown): number {
  try {
    const def = typeof definitionJson === "string" ? JSON.parse(definitionJson) : definitionJson;
    if (def && Array.isArray(def.sections)) {
      for (const sec of def.sections) {
        if (Array.isArray(sec.fields)) {
          for (const f of sec.fields) {
            if (f.type === "payment" && f.paymentAmount !== undefined) {
              return Number(f.paymentAmount);
            }
          }
        }
      }
    }
  } catch {
    // fallback
  }
  return 0;
}

function checkTransactionValidity(txId: string | null, status: string): { isValid: boolean; isFakeOrSuspicious: boolean } {
  if (!txId || !txId.trim()) {
    return { isValid: false, isFakeOrSuspicious: true };
  }
  const cleanTx = txId.trim().toLowerCase();
  
  // Known fake / dummy patterns
  const dummyPatterns = ["123", "1234", "12345", "0000", "test", "fake", "dummy", "asdf", "nil", "none", "na", "null"];
  const isDummy = dummyPatterns.some((pattern) => cleanTx === pattern || cleanTx.startsWith(pattern));
  
  if (isDummy || cleanTx.length < 5) {
    return { isValid: false, isFakeOrSuspicious: true };
  }

  if (status === "verified") {
    return { isValid: true, isFakeOrSuspicious: false };
  }

  return { isValid: false, isFakeOrSuspicious: false };
}

export async function getAdminTransactions(): Promise<{
  success: boolean;
  data?: TransactionItem[];
  paymentForms?: PaymentFormOption[];
  error?: string;
}> {
  try {
    const responses = await prisma.formResponse.findMany({
      include: {
        form: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const paymentFormsMap = new Map<string, { title: string; paymentAmount: number }>();
    const items: TransactionItem[] = [];

    for (const res of responses) {
      const formDef = res.form?.definition;
      const isPaymentForm = hasFormPaymentField(formDef);
      const txId = res.transactionId ? res.transactionId.trim() : null;

      // Filter: Show ONLY form responses that are associated with a payment field or have a transaction ID
      if (!isPaymentForm && !txId) {
        continue;
      }

      const amount = extractPaymentAmount(formDef);

      if (res.form?.formId && res.form?.title) {
        paymentFormsMap.set(res.form.formId, { title: res.form.title, paymentAmount: amount });
      }

      const ans = (res.answers as Record<string, unknown>) || {};
      const status = res.paymentStatus || "pending";
      const { isValid, isFakeOrSuspicious } = checkTransactionValidity(txId, status);

      items.push({
        id: res.id,
        formId: res.form?.formId || "N/A",
        formTitle: res.form?.title || "Form Registration",
        receiptNumber: `CB-INV-${res.id.slice(0, 8).toUpperCase()}`,
        transactionId: txId,
        paymentStatus: status,
        paymentAmount: amount,
        recipientName: extractName(ans),
        recipientEmail: extractEmail(ans),
        answers: ans,
        createdAt: res.createdAt.toISOString(),
        verifiedAt: res.verifiedAt ? res.verifiedAt.toISOString() : null,
        hasFormPaymentField: isPaymentForm,
        isValidTransaction: isValid,
        isFakeOrSuspicious,
      });
    }

    const paymentForms: PaymentFormOption[] = Array.from(paymentFormsMap.entries()).map(
      ([formId, info]) => ({ formId, title: info.title, paymentAmount: info.paymentAmount })
    );

    return { success: true, data: items, paymentForms };
  } catch (err: unknown) {
    console.error("Error fetching admin transactions:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to load transactions." };
  }
}

export async function resendTransactionReceipt(responseId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await prisma.formResponse.findUnique({
      where: { id: responseId },
      include: { form: true },
    });

    if (!res) {
      return { success: false, error: "Response not found." };
    }

    const ans = (res.answers as Record<string, unknown>) || {};
    const name = extractName(ans);
    const email = extractEmail(ans);
    const amount = extractPaymentAmount(res.form?.definition);
    const referenceNumber = `CB-INV-${res.id.slice(0, 8).toUpperCase()}`;

    if (!email || email === "N/A") {
      return { success: false, error: "Participant email not found in response answers." };
    }

    await sendFormResponseInvoiceEmail({
      to: email,
      recipientName: name,
      formTitle: res.form?.title || "Form Registration",
      referenceNumber,
      issuedDate: res.verifiedAt ? res.verifiedAt.toLocaleDateString("en-US") : res.createdAt.toLocaleDateString("en-US"),
      transactionId: res.transactionId || "",
      paymentAmount: amount,
    });

    revalidatePath("/admin/transactions");
    return { success: true, message: `Receipt re-sent to ${email} successfully!` };
  } catch (err: unknown) {
    console.error("Failed to resend receipt:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to resend receipt." };
  }
}

