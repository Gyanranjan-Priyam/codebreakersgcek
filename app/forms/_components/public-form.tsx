"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  ExternalLink,
  Loader2,
  Calendar as CalendarIcon,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Check,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { submitFormResponse } from "../actions";
import type { PublishedFormResponse } from "../actions";
import { FormFieldDefinition } from "@/lib/form-types";

interface PublicFormProps {
  form: PublishedFormResponse;
}

function getImageUrl(key?: string | null) {
  if (!key) return "";
  return `https://codebreakers.t3.storage.dev/${key}`;
}

/* ─── Static Application CSS ─── */
const DYNAMIC_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  @media (prefers-reduced-motion: reduce) {
    .tf-stage-rise { animation: none !important; opacity: 1 !important; transform: none !important; }
    .tf-progress-bar { transition: none !important; }
  }
  @keyframes tfStageRise {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .tf-stage-rise { animation: tfStageRise .45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  *, *::before, *::after { box-sizing: border-box; }

  .tf-shell {
    transition: background .5s ease;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: #1C1B1F;
    position: relative;
    overflow-x: hidden;
  }

  .tf-progress-track {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: rgba(28,27,31,0.08);
    z-index: 50;
  }
  .tf-progress-bar {
    height: 100%;
    background: #1F4D3D;
    transition: width .4s ease;
  }

  .tf-brand-mark {
    position: fixed;
    top: 24px; left: 24px;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tf-brand-logo {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 1px solid #E7E5DE;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tf-brand-text {
    font-family: 'Sora', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #1C1B1F;
    letter-spacing: -0.01em;
  }

  .tf-step-counter {
    position: fixed;
    top: 28px; right: 24px;
    z-index: 40;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #6E6D78;
    letter-spacing: 0.05em;
  }

  .tf-banner-hero {
    width: 100%;
    height: 160px;
    position: relative;
    overflow: hidden;
  }

  .tf-stage-container {
    min-height: 100vh;
    max-width: 620px;
    margin: 0 auto;
    padding: 90px 24px 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media (max-width: 520px) {
    .tf-stage-container { padding: 80px 20px 140px; }
    .tf-brand-mark { top: 16px; left: 16px; }
    .tf-step-counter { top: 20px; right: 16px; }
  }

  .tf-tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .tf-tag-badge {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #1F4D3D;
    color: #FFFFFF;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tf-tag-label {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1F4D3D;
  }

  .tf-question-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(24px, 4.4vw, 36px);
    font-weight: 600;
    color: #1C1B1F;
    line-height: 1.25;
    letter-spacing: -0.01em;
    margin: 0 0 10px;
  }
  .tf-question-sub {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #6E6D78;
    line-height: 1.5;
    margin: 0 0 34px;
  }

  .tf-input-field {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid #E7E5DE;
    outline: none;
    font-family: 'Sora', sans-serif;
    font-size: clamp(21px, 3.5vw, 26px);
    font-weight: 500;
    color: #1C1B1F;
    padding: 12px 0;
    transition: border-color .2s ease;
    display: block;
  }
  .tf-input-field::placeholder { color: #C9C7BE; font-weight: 400; }
  .tf-input-field:focus { border-bottom-color: #1F4D3D; }

  .tf-textarea-field {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid #E7E5DE;
    outline: none;
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #1C1B1F;
    padding: 12px 0;
    transition: border-color .2s ease;
    resize: vertical;
  }
  .tf-textarea-field::placeholder { color: #C9C7BE; }
  .tf-textarea-field:focus { border-bottom-color: #1F4D3D; }

  .tf-hint-enter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #6E6D78;
    margin-top: 14px;
  }

  .tf-scale-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
  .tf-scale-btn {
    width: 54px; height: 54px;
    border-radius: 14px;
    border: 2px solid #E7E5DE;
    background: #FFFFFF;
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #1C1B1F;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  }
  .tf-scale-btn:hover { border-color: #1F4D3D; transform: translateY(-1px); }
  .tf-scale-btn.active {
    background: #1F4D3D;
    border-color: #1F4D3D;
    color: #FFFFFF;
    box-shadow: 0 6px 16px -2px rgba(31,77,61,0.35);
  }

  .tf-option-card {
    width: 100%;
    background: #FFFFFF;
    border: 2px solid #E7E5DE;
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all .15s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  }
  .tf-option-card:hover { border-color: #1F4D3D; transform: translateY(-1px); }
  .tf-option-card.selected {
    border-color: #1F4D3D;
    background: #E9EFEA;
  }
  .tf-option-label {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #1C1B1F;
  }
  .tf-option-check {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid #E7E5DE;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s ease;
  }
  .tf-option-card.selected .tf-option-check {
    background: #1F4D3D;
    border-color: #1F4D3D;
    color: #FFFFFF;
  }

  .tf-fee-card {
    background: #FFFFFF;
    border: 2px solid #E7E5DE;
    border-radius: 18px;
    padding: 24px 28px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  }
  .tf-fee-amount {
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #14352A;
  }

  .tf-review-card {
    background: #FFFFFF;
    border: 2px solid #E7E5DE;
    border-radius: 18px;
    padding: 24px 28px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  }
  .tf-review-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid #E7E5DE;
    gap: 16px;
  }
  .tf-review-item:last-child { border-bottom: none; }

  .tf-nav-controls {
    position: fixed;
    bottom: 28px; right: 28px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tf-nav-btn {
    width: 50px; height: 50px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s ease;
  }
  .tf-nav-btn-prev {
    background: #FFFFFF;
    color: #1C1B1F;
    border: 1px solid #E7E5DE;
    box-shadow: 0 4px 14px rgba(28,27,31,0.12);
  }
  .tf-nav-btn-prev:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(28,27,31,0.16); }
  .tf-nav-btn-next {
    background: #1F4D3D;
    color: #FFFFFF;
    box-shadow: 0 6px 18px rgba(31,77,61,0.35);
  }
  .tf-nav-btn-next:hover:not(:disabled) { transform: translateY(-2px); background: #193F32; }
  .tf-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  .tf-submit-pill {
    background: #1F4D3D;
    color: #FFFFFF;
    border: none;
    border-radius: 999px;
    padding: 16px 32px;
    font-family: 'Sora', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 22px rgba(31,77,61,0.35);
    transition: all .15s ease;
  }
  .tf-submit-pill:hover:not(:disabled) { background: #193F32; transform: translateY(-2px); }

  .tf-footer {
    position: fixed;
    bottom: 24px; left: 24px;
    z-index: 40;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #6E6D78;
  }
  .tf-footer a { color: #6E6D78; text-decoration: none; font-weight: 500; }
  .tf-footer a:hover { color: #1C1B1F; }
  @media (max-width: 520px) {
    .tf-footer { display: none; }
    .tf-nav-controls { bottom: 20px; right: 16px; }
  }
`;

/* ─── Ambient Tints for Step Cycling ─── */
const AMBIENT_TINTS = [
  "#FDFBF7", // Step 1: Warm neutral
  "#F5F8F6", // Step 2: Mint sage tint
  "#FBF9F4", // Step 3: Peach tint
  "#F4F7F5", // Step 4: Sage
  "#F9F8FA", // Step 5: Soft gray
];

/* ─── Step Contract ─── */
export interface FormStep {
  id: string;
  type: "name" | "email" | "field" | "review";
  sectionTitle: string;
  sectionIndex: number;
  questionNumber: number;
  label: string;
  description?: string;
  field?: FormFieldDefinition;
}

function buildSteps(form: PublishedFormResponse): FormStep[] {
  const steps: FormStep[] = [];
  let qNum = 1;

  // Name step
  if (form.definition.settings.collectName) {
    steps.push({
      id: "meta-name",
      type: "name",
      sectionTitle: "PERSONAL",
      sectionIndex: 0,
      questionNumber: qNum++,
      label: "What's your full name?",
      description: "As it should appear on your record.",
    });
  }

  // Email step
  if (form.definition.settings.collectEmail) {
    steps.push({
      id: "meta-email",
      type: "email",
      sectionTitle: "CONTACT",
      sectionIndex: 0,
      questionNumber: qNum++,
      label: "What's your email address?",
      description: "We'll send your confirmation here.",
    });
  }

  // Section fields
  form.definition.sections.forEach((sec, sIdx) => {
    sec.fields.forEach((f) => {
      steps.push({
        id: f.id,
        type: "field",
        sectionTitle: sec.title.toUpperCase(),
        sectionIndex: sIdx,
        questionNumber: qNum++,
        label: f.label,
        description: f.description,
        field: f,
      });
    });
  });

  // Review step
  steps.push({
    id: "review",
    type: "review",
    sectionTitle: "REVIEW",
    sectionIndex: form.definition.sections.length,
    questionNumber: qNum,
    label: "Check your answers",
    description: "One tap from submitting your response.",
  });

  return steps;
}

function displayAnswer(
  val: string | string[] | Record<string, string> | undefined,
  field?: FormFieldDefinition
): string {
  if (!val) return "—";
  if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "—";
  if (typeof val === "object") {
    const pairs: string[] = [];
    const subQuestions = field?.subQuestions || [];
    for (const [k, v] of Object.entries(val)) {
      if (typeof v === "string" && v.trim()) {
        const sub = subQuestions.find((s) => s.id === k || s.label === k);
        const label = sub?.label || k;
        pairs.push(`${label}: ${v.trim()}`);
      }
    }
    return pairs.length > 0 ? pairs.join(" • ") : "—";
  }
  return String(val).trim() || "—";
}

export default function PublicForm({ form }: PublicFormProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({});
  const [animKey, setAnimKey] = useState(0);

  // ─── Client-side Public Form Draft Restore ───
  useEffect(() => {
    try {
      const draftKey = `public_form_draft_${form.formId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.transactionId) setTransactionId(parsed.transactionId);
        if (parsed.answers && typeof parsed.answers === "object") setAnswers(parsed.answers);
        if (typeof parsed.currentStepIdx === "number") setCurrentStepIdx(parsed.currentStepIdx);
        toast.info("Restored your saved form responses from last session.", { duration: 4000 });
      }
    } catch {
      // ignore storage error
    }
  }, [form.formId]);

  // ─── Auto-Save Draft Progress (No Server Spam) ───
  useEffect(() => {
    if (success) return;
    try {
      const draftKey = `public_form_draft_${form.formId}`;
      localStorage.setItem(
        draftKey,
        JSON.stringify({ name, email, transactionId, answers, currentStepIdx })
      );
    } catch {
      // ignore storage error
    }
  }, [form.formId, name, email, transactionId, answers, currentStepIdx, success]);

  const steps = useMemo(() => buildSteps(form), [form]);
  const totalQuestionSteps = Math.max(1, steps.length - 1);
  const currentStep = steps[currentStepIdx] || steps[0];
  const isReviewStep = currentStep.type === "review";

  const allFields = useMemo(
    () => form.definition.sections.flatMap((s) => s.fields),
    [form]
  );
  const paymentField = useMemo(
    () => allFields.find((f) => f.type === "payment") || null,
    [allFields]
  );

  const firstName = name.split(" ")[0] || "there";
  const ambientBg = success
    ? "#F1F8F5"
    : AMBIENT_TINTS[currentStepIdx % AMBIENT_TINTS.length];

  /* ─── Answer Helpers ─── */
  const updateAnswer = (id: string, val: string | string[] | Record<string, string>) =>
    setAnswers((c) => ({ ...c, [id]: val }));

  const toggleCheckbox = (id: string, opt: string) => {
    const cur = (answers[id] as string[] | undefined) || [];
    updateAnswer(
      id,
      cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt]
    );
  };

  const copyToClipboard = (text: string, label: string = "UPI ID") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    }
  };

  const openUpi = () => {
    if (!paymentField?.upiId) return;
    const payee = paymentField.payeeName || form.title;
    const amountParam = paymentField.paymentAmount !== undefined ? `&am=${paymentField.paymentAmount}` : "";
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      paymentField.upiId
    )}&pn=${encodeURIComponent(payee)}${amountParam}&cu=INR`;

    // Automatically copy UPI ID so user can paste it directly if desktop browser blocks upi://
    copyToClipboard(paymentField.upiId, "UPI ID");

    const isMobile = /Android|iPhone|iPad|iPod/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );

    if (isMobile) {
      toast.success("Opening UPI payment app...");
      window.location.href = upiUrl;
    } else {
      toast.info(
        `UPI ID (${paymentField.upiId}) copied! Scan the QR code with GPay/PhonePe or open your app to pay ₹${paymentField.paymentAmount ?? 0}.`,
        { duration: 5000 }
      );
      try {
        window.location.href = upiUrl;
      } catch {
        // Suppress browser scheme error on desktop
      }
    }
  };

  /* ─── Validation ─── */
  const isCurrentStepValid = useCallback(() => {
    if (currentStep.type === "name") return Boolean(name.trim());
    if (currentStep.type === "email")
      return Boolean(email.trim()) && email.includes("@");
    if (currentStep.type === "field" && currentStep.field) {
      const f = currentStep.field;
      if (f.type === "multi_input") {
        const valObj = (answers[f.id] as Record<string, string> | undefined) || {};
        const subQuestions = f.subQuestions || [];
        for (const sub of subQuestions) {
          if (sub.required && !valObj[sub.id]?.trim()) {
            return false;
          }
        }
        if (f.required) {
          const hasAny = Object.values(valObj).some((v) => typeof v === "string" && v.trim().length > 0);
          if (!hasAny) return false;
        }
        return true;
      }
      if (!f.required) return true;
      if (f.type === "payment") return Boolean(transactionId.trim());
      const val = answers[f.id];
      if (Array.isArray(val)) return val.length > 0;
      return Boolean(typeof val === "string" && val.trim());
    }
    return true;
  }, [currentStep, name, email, answers, transactionId]);

  /* ─── Navigation ─── */
  const goToStep = useCallback(
    (idx: number) => {
      const target = Math.max(0, Math.min(idx, steps.length - 1));
      setCurrentStepIdx(target);
      setAnimKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [steps.length]
  );

  const goNext = useCallback(() => {
    if (!isCurrentStepValid()) {
      if (currentStep.type === "name") toast.error("Please enter your name");
      else if (currentStep.type === "email")
        toast.error("Please enter a valid email address");
      else if (currentStep.field?.type === "payment")
        toast.error("Please enter your Transaction ID");
      else toast.error("Please answer this required question");
      return;
    }
    if (currentStepIdx < steps.length - 1) {
      goToStep(currentStepIdx + 1);
    }
  }, [currentStepIdx, steps.length, isCurrentStepValid, currentStep, goToStep]);

  const goPrev = useCallback(() => {
    if (currentStepIdx > 0) {
      goToStep(currentStepIdx - 1);
    }
  }, [currentStepIdx, goToStep]);

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (paymentField && !transactionId.trim()) {
      toast.error("Please enter your Transaction ID");
      return;
    }
    setIsSubmitting(true);
    const result = await submitFormResponse({
      formId: form.formId,
      answers: {
        ...answers,
        name: form.definition.settings.collectName ? name : undefined,
        email: form.definition.settings.collectEmail ? email : undefined,
      },
      transactionId,
    });
    if (result.status === "success") {
      setSuccess(true);
      try {
        localStorage.removeItem(`public_form_draft_${form.formId}`);
      } catch {
        // ignore storage error
      }
    } else {
      toast.error(result.message);
    }
    setIsSubmitting(false);
  };

  /* ─── Keyboard Navigation ─── */
  useEffect(() => {
    if (success) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextarea = target?.tagName === "TEXTAREA";
      if (isTextarea && e.key === "Enter" && !e.shiftKey) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (isReviewStep) {
          handleSubmit();
        } else {
          goNext();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isReviewStep, success]);

  /* ─── Progress Fill ─── */
  const progressPct = isReviewStep
    ? 100
    : Math.min(100, Math.max(0, ((currentStepIdx + 1) / totalQuestionSteps) * 100));

  /* ═══ RENDER: SUCCESS SCREEN ═══ */
  if (success) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: DYNAMIC_CSS }} />
        <div className="tf-shell" style={{ background: "#F1F8F5" }}>
          <div className="tf-stage-container text-center items-center">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#1F4D3D",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 8px 24px rgba(31,77,61,0.3)",
              }}
            >
              <Check style={{ width: 32, height: 32, strokeWidth: 3 }} />
            </div>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "#1F4D3D",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Registration Complete
            </p>

            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 700,
                color: "#1C1B1F",
                marginBottom: 14,
              }}
            >
              You&apos;re in, {firstName}!
            </h1>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                color: "#6E6D78",
                lineHeight: 1.6,
                maxWidth: 440,
                margin: "0 auto 36px",
              }}
            >
              {form.definition.settings.successMessage ||
                `Confirmation sent to ${email || "your email"}. See you at Codebreakers.`}
            </p>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setAnswers({});
                setName("");
                setEmail("");
                setTransactionId("");
                setCurrentStepIdx(0);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#6E6D78",
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Submit another response
            </button>

            <div className="mt-12 flex items-center justify-center gap-2">
              <div className="tf-brand-logo">
                <Image src="/assets/logo.png" alt="Codebreakers" width={42} height={42} style={{ objectFit: "contain" }} />
              </div>
              <span className="tf-brand-text">Codebreakers</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═══ RENDER: STAGE CONTENT ═══ */
  const renderStageContent = () => {
    if (isReviewStep) {
      const rows: Array<{
        label: string;
        value: string;
        stepIndex: number;
      }> = [];

      if (form.definition.settings.collectName) {
        rows.push({ label: "Full Name", value: displayAnswer(name), stepIndex: 0 });
      }
      if (form.definition.settings.collectEmail) {
        rows.push({
          label: "Email Address",
          value: displayAnswer(email),
          stepIndex: form.definition.settings.collectName ? 1 : 0,
        });
      }

      let qIdx = (form.definition.settings.collectName ? 1 : 0) + (form.definition.settings.collectEmail ? 1 : 0);
      allFields
        .filter((f) => f.type !== "button" && f.type !== "payment")
        .forEach((f) => {
          rows.push({
            label: f.label,
            value: displayAnswer(answers[f.id], f),
            stepIndex: qIdx++,
          });
        });

      if (paymentField) {
        rows.push({
          label: paymentField.transactionIdLabel || "Transaction ID",
          value: displayAnswer(transactionId),
          stepIndex: qIdx,
        });
      }

      return (
        <div key={animKey} className="tf-stage-rise space-y-6">
          <div className="tf-tag-row">
            <span className="tf-tag-badge">{currentStep.questionNumber}</span>
            <span className="tf-tag-label">{currentStep.sectionTitle}</span>
          </div>

          <h1 className="tf-question-title">{currentStep.label}</h1>
          <p className="tf-question-sub">{currentStep.description}</p>

          <div className="tf-review-card">
            {rows.map((r, i) => (
              <div key={i} className="tf-review-item">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{r.label}</p>
                  <p className="text-base font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>{r.value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(r.stepIndex)}
                  className="text-xs font-semibold text-primary hover:underline shrink-0 pt-1"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-start">
            <button
              type="button"
              className="tf-submit-pill"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Submitting…</>
              ) : (
                <>{form.definition.settings.submitButtonLabel || "Submit Response"} <Check className="h-5 w-5" /></>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={animKey} className="tf-stage-rise">
        <div className="tf-tag-row">
          <span className="tf-tag-badge">{currentStep.questionNumber}</span>
          <span className="tf-tag-label">{currentStep.sectionTitle}</span>
        </div>

        <h1 className="tf-question-title">{currentStep.label}</h1>
        {currentStep.description && (
          <p className="tf-question-sub">{currentStep.description}</p>
        )}

        {currentStep.field?.imageKey && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-border">
            <Image src={getImageUrl(currentStep.field.imageKey)} alt="" fill className="object-cover" />
          </div>
        )}

        {currentStep.type === "name" && (
          <div>
            <input
              className="tf-input-field"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name here..."
            />
            <span className="tf-hint-enter">
              press <strong className="font-semibold text-foreground">Enter ↵</strong>
            </span>
          </div>
        )}

        {currentStep.type === "email" && (
          <div>
            <input
              className="tf-input-field"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
            <span className="tf-hint-enter">
              press <strong className="font-semibold text-foreground">Enter ↵</strong>
            </span>
          </div>
        )}

        {currentStep.type === "field" && currentStep.field && (
          <div>
            {(currentStep.field.type === "short_text" ||
              currentStep.field.type === "email" ||
              currentStep.field.type === "number") && (
              <div>
                <input
                  className="tf-input-field"
                  type={currentStep.field.type === "email" ? "email" : currentStep.field.type === "number" ? "number" : "text"}
                  autoFocus
                  value={(answers[currentStep.field.id] as string) || ""}
                  onChange={(e) => updateAnswer(currentStep.field!.id, e.target.value)}
                  placeholder={currentStep.field.placeholder || "Type your answer..."}
                />
                <span className="tf-hint-enter">
                  press <strong className="font-semibold text-foreground">Enter ↵</strong>
                </span>
              </div>
            )}

            {currentStep.field.type === "multi_input" && (
              <div className="space-y-6">
                {(currentStep.field.subQuestions || []).map((sub, idx) => {
                  const currentValObj = (answers[currentStep.field!.id] as Record<string, string> | undefined) || {};
                  const subVal = currentValObj[sub.id] || "";
                  return (
                    <div key={sub.id || idx} className="space-y-2">
                      <label className="block font-semibold text-foreground text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {sub.label || `Sub-question ${idx + 1}`}
                        {(sub.required || currentStep.field!.required) && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      <input
                        className="tf-input-field"
                        type="text"
                        value={subVal}
                        onChange={(e) => {
                          const updated = { ...currentValObj, [sub.id]: e.target.value };
                          updateAnswer(currentStep.field!.id, updated);
                        }}
                        placeholder={sub.placeholder || "Type your answer here..."}
                      />
                    </div>
                  );
                })}
                <span className="tf-hint-enter">
                  press <strong className="font-semibold text-foreground">Enter ↵</strong> when done
                </span>
              </div>
            )}

            {currentStep.field.type === "long_text" && (
              <div>
                <textarea
                  className="tf-textarea-field"
                  autoFocus
                  rows={3}
                  value={(answers[currentStep.field.id] as string) || ""}
                  onChange={(e) => updateAnswer(currentStep.field!.id, e.target.value)}
                  placeholder={currentStep.field.placeholder || "Type your answer here..."}
                />
                <span className="tf-hint-enter">
                  press <strong className="font-semibold text-foreground">Shift + Enter</strong> for line break
                </span>
              </div>
            )}

            {currentStep.field.type === "linear_scale" && (
              <div>
                <div className="tf-scale-grid">
                  {Array.from(
                    { length: (currentStep.field.scaleMax ?? 5) - (currentStep.field.scaleMin ?? 1) + 1 },
                    (_, idx) => (currentStep.field!.scaleMin ?? 1) + idx
                  ).map((num) => {
                    const selected = answers[currentStep.field!.id] === String(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        className={`tf-scale-btn ${selected ? "active" : ""}`}
                        onClick={() => {
                          updateAnswer(currentStep.field!.id, String(num));
                          setTimeout(() => goNext(), 200);
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                {(currentStep.field.scaleMinLabel || currentStep.field.scaleMaxLabel) && (
                  <div className="flex justify-between text-xs font-medium text-muted-foreground mt-3 max-w-xs px-1">
                    <span>{currentStep.field.scaleMinLabel || ""}</span>
                    <span>{currentStep.field.scaleMaxLabel || ""}</span>
                  </div>
                )}
              </div>
            )}

            {currentStep.field.type === "radio" && (
              <RadioGroup
                value={(answers[currentStep.field.id] as string) || ""}
                onValueChange={(opt) => {
                  updateAnswer(currentStep.field!.id, opt);
                  setTimeout(() => goNext(), 200);
                }}
                className="space-y-3"
              >
                {(currentStep.field.options || ["Option 1"]).map((opt) => {
                  const selected = answers[currentStep.field!.id] === opt;
                  return (
                    <label
                      key={opt}
                      className={`tf-option-card flex items-center justify-between cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        selected ? "selected border-[#1F4D3D] bg-[#E9EFEA]" : "border-[#E7E5DE] bg-white hover:border-[#1F4D3D]"
                      }`}
                    >
                      <span className="tf-option-label">{opt}</span>
                      <RadioGroupItem value={opt} className="h-5 w-5 border-2 border-[#E7E5DE] text-[#1F4D3D]" />
                    </label>
                  );
                })}
              </RadioGroup>
            )}

            {currentStep.field.type === "checkbox" && (
              <div className="space-y-3">
                {(currentStep.field.options || ["Option 1"]).map((opt) => {
                  const cur = (answers[currentStep.field!.id] as string[]) || [];
                  const selected = cur.includes(opt);
                  return (
                    <div
                      key={opt}
                      className={`tf-option-card flex items-center justify-between cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        selected ? "selected border-[#1F4D3D] bg-[#E9EFEA]" : "border-[#E7E5DE] bg-white hover:border-[#1F4D3D]"
                      }`}
                      onClick={() => toggleCheckbox(currentStep.field!.id, opt)}
                    >
                      <span className="tf-option-label">{opt}</span>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleCheckbox(currentStep.field!.id, opt)}
                        className="h-5 w-5 rounded-md border-2 border-[#E7E5DE] data-[state=checked]:bg-[#1F4D3D] data-[state=checked]:border-[#1F4D3D]"
                      />
                    </div>
                  );
                })}
                <span className="tf-hint-enter">
                  press <strong className="font-semibold text-foreground">Enter ↵</strong> when done
                </span>
              </div>
            )}

            {currentStep.field.type === "dropdown" && (
              <div className="pt-2">
                <Select
                  value={(answers[currentStep.field.id] as string) || ""}
                  onValueChange={(val) => {
                    updateAnswer(currentStep.field!.id, val);
                    setTimeout(() => goNext(), 200);
                  }}
                >
                  <SelectTrigger className="w-full max-w-md h-12 bg-white border-2 border-[#E7E5DE] rounded-xl text-base font-medium text-[#1C1B1F] shadow-sm focus:border-[#1F4D3D]">
                    <SelectValue placeholder="Choose an option..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border shadow-xl">
                    {(currentStep.field.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-base py-2.5 font-medium cursor-pointer">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep.field.type === "date" && (
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="tf-input-field text-left flex items-center justify-between cursor-pointer max-w-xs"
                    >
                      <span>
                        {answers[currentStep.field.id]
                          ? format(new Date(answers[currentStep.field.id] as string), "PPP")
                          : "Pick a date..."}
                      </span>
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        answers[currentStep.field.id]
                          ? new Date(answers[currentStep.field.id] as string)
                          : undefined
                      }
                      onSelect={(day) => {
                        if (day) {
                          updateAnswer(currentStep.field!.id, day.toISOString().split("T")[0]);
                          setTimeout(() => goNext(), 300);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {currentStep.field.type === "payment" && (
              <div className="space-y-4">
                <div className="tf-fee-card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Due</span>
                    <span className="tf-fee-amount">
                      ₹{currentStep.field.paymentAmount ?? 0}
                    </span>
                  </div>
                  {currentStep.field.upiId && (
                    <div className="relative w-48 h-48 mx-auto mb-4 bg-white rounded-2xl border border-border/60 p-3 shadow-sm flex flex-col items-center justify-center">
                      {/* eslint-disable-next-html-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
                          `upi://pay?pa=${currentStep.field.upiId}&pn=${encodeURIComponent(
                            currentStep.field.payeeName || form.title
                          )}${
                            currentStep.field.paymentAmount !== undefined
                              ? `&am=${currentStep.field.paymentAmount}`
                              : ""
                          }&cu=INR`
                        )}`}
                        alt="Dynamic UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  {currentStep.field.upiId && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-muted-foreground font-medium">Scan QR or Pay via App</span>
                          <span className="text-sm font-bold text-foreground font-mono">{currentStep.field.upiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentStep.field!.upiId!, "UPI ID")}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Copy UPI ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={openUpi}
                        className="bg-[#1F4D3D] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#15362B] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay Now ➔
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    {currentStep.field.transactionIdLabel || "Transaction ID"} <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="tf-input-field"
                    type="text"
                    autoFocus
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Paste transaction ID..."
                  />
                  <span className="tf-hint-enter">
                    press <strong className="font-semibold text-foreground">Enter ↵</strong>
                  </span>
                </div>
              </div>
            )}

            {currentStep.field.type === "button" && (
              <div>
                <button
                  type="button"
                  className="tf-submit-pill"
                  onClick={() => {
                    if (!currentStep.field?.buttonUrl) return;
                    currentStep.field.buttonOpenInNewTab
                      ? window.open(currentStep.field.buttonUrl, "_blank", "noopener,noreferrer")
                      : (window.location.href = currentStep.field.buttonUrl);
                  }}
                >
                  {currentStep.field.buttonLabel || "Open link"} <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ═══ MAIN RENDER ═══ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DYNAMIC_CSS }} />

      <div className="tf-shell" style={{ background: ambientBg }}>
        {/* ─── 1. FIXED TOP PROGRESS BAR ─── */}
        <div className="tf-progress-track">
          <div className="tf-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ─── 2. FIXED BRAND MARK & STEP COUNTER ─── */}
        <div className="tf-brand-mark">
          <div className="tf-brand-logo">
            <Image src="/assets/logo.png" alt="Codebreakers" width={42} height={42} style={{ objectFit: "contain" }} />
          </div>
          <span className="tf-brand-text">Codebreakers</span>
        </div>

        <div className="tf-step-counter">
          {isReviewStep ? (
            "REVIEW"
          ) : (
            <>{String(currentStepIdx + 1).padStart(2, "0")} / {String(totalQuestionSteps).padStart(2, "0")}</>
          )}
        </div>

        {/* ─── 3. MAIN CENTERED STAGE CONTENT ─── */}
        <div className="tf-stage-container">
          {renderStageContent()}
        </div>

        {/* ─── 5. FIXED STACKED NAVIGATION CHEVRONS ─── */}
        <div className="tf-nav-controls">
          <button
            type="button"
            className="tf-nav-btn tf-nav-btn-prev"
            onClick={goPrev}
            disabled={currentStepIdx === 0}
            aria-label="Previous step"
            title="Previous step (Arrow Up)"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
          {!isReviewStep && (
            <button
              type="button"
              className="tf-nav-btn tf-nav-btn-next"
              onClick={goNext}
              aria-label="Next step"
              title="Next step (Arrow Down / Enter)"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* ─── 6. FIXED PERSISTENT FOOTER ─── */}
        <div className="tf-footer">
          <a href="/privacy">Privacy Policy</a>
          <span style={{ margin: "0 8px", color: "#E7E5DE" }}>·</span>
          Powered by <strong>Codebreakers</strong>
        </div>
      </div>
    </>
  );
}
