"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import type { FormDefinition } from "@/lib/form-types";
import { sendFormSubmissionEmail } from "@/lib/mailer";

export interface PublishedFormResponse {
  id: string;
  formId: string;
  title: string;
  description: string | null;
  definition: FormDefinition;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function hasPaymentField(definition: FormDefinition) {
  return definition.sections.some((section) =>
    section.fields.some((field) => field.type === "payment")
  );
}

export async function getPublishedFormByFormId(formId: string) {
  try {
    const form = await prisma.form.findFirst({
      where: { formId },
      select: {
        id: true,
        formId: true,
        title: true,
        description: true,
        definition: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!form) {
      return { status: "error" as const, message: "Form not found" };
    }

    return {
      status: "success" as const,
      data: {
        ...form,
        definition: form.definition as unknown as FormDefinition,
      } as PublishedFormResponse,
    };
  } catch (error) {
    console.error("Error fetching published form:", error);
    return { status: "error" as const, message: "Failed to fetch form" };
  }
}

export async function submitFormResponse(input: {
  formId: string;
  answers: Record<string, unknown>;
  transactionId?: string | null;
}) {
  try {
    const form = await prisma.form.findFirst({
      where: { formId: input.formId },
      select: {
        id: true,
        title: true,
        definition: true,
      },
    });

    if (!form) {
      return { status: "error" as const, message: "Form not found" };
    }

    const formDef = form.definition as unknown as FormDefinition;

    if (hasPaymentField(formDef) && !input.transactionId?.trim()) {
      return {
        status: "error" as const,
        message: "Transaction ID is required for payment forms",
      };
    }

    const response = await prisma.formResponse.create({
      data: {
        id: randomUUID(),
        formId: form.id,
        answers: input.answers as unknown as import("@prisma/client").Prisma.InputJsonValue,
        transactionId: input.transactionId?.trim() || null,
        paymentStatus: hasPaymentField(formDef) ? "pending" : "submitted",
      },
    });

    // Trigger submission confirmation email asynchronously if recipient email is present
    let recipientEmail = "";
    let recipientName = "";

    const ansRecord = (input.answers || {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(ansRecord)) {
      if (typeof v === "string") {
        const valStr = v.trim();
        const keyLower = k.toLowerCase();
        if (!recipientEmail && (keyLower.includes("email") || (valStr.includes("@") && valStr.includes(".")))) {
          recipientEmail = valStr;
        }
        if (!recipientName && keyLower.includes("name") && valStr) {
          recipientName = valStr;
        }
      }
    }

    if (recipientEmail) {
      const firstName = recipientName ? recipientName.split(" ")[0] : "there";
      const responseIdStr = `#${response.id.slice(0, 8).toUpperCase()}`;
      const submittedAtStr = new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      sendFormSubmissionEmail({
        to: recipientEmail,
        firstName,
        formName: form.title || "Form",
        responseId: responseIdStr,
        submittedAt: submittedAtStr,
      }).catch((err) => console.error("Error sending form submission email:", err));
    }

    return {
      status: "success" as const,
      message: "Response submitted successfully",
      data: response,
    };
  } catch (error) {
    console.error("Error submitting form response:", error);
    return { status: "error" as const, message: "Failed to submit response" };
  }
}
