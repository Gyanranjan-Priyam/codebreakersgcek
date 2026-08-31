/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect } from "react";
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
  Check,
  Copy,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { submitFormResponse } from "../actions";
import type { PublishedFormResponse } from "../actions";
import { FormFieldDefinition, BANNER_TEMPLATES } from "@/lib/form-types";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import parse from "html-react-parser";
import { FormFileUploader, ProcessedFormFile } from "./form-file-uploader";

interface PublicFormProps {
  form: PublishedFormResponse;
}

function getImageUrl(key?: string | null) {
  if (!key) return "";
  return `https://codebreakers.t3.storage.dev/${key}`;
}

/* ─── CSS ─── */
const FORM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .mf-page {
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: #1C1B1F;
    position: relative;
  }

  /* ─── Gradient Banner ─── */
  .mf-banner {
    width: 100%;
    height: 180px;
    position: relative;
    z-index: 0;
  }
  @media (max-width: 640px) {
    .mf-banner { height: 120px; }
  }

  /* ─── Main Card Container ─── */
  .mf-container {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: -80px auto 0;
    padding: 0 20px 60px;
  }
  @media (max-width: 640px) {
    .mf-container { margin-top: -50px; padding: 0 12px 40px; }
  }

  .mf-card {
    background: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    padding: 40px 48px;
    margin-bottom: 0;
  }
  @media (max-width: 640px) {
    .mf-card { padding: 24px 20px; border-radius: 6px; }
  }

  /* ─── Form Header ─── */
  .mf-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 700;
    color: #1C1B1F;
    line-height: 1.3;
    letter-spacing: -0.01em;
    margin: 0 0 16px;
    text-transform: uppercase;
  }
  .mf-description {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #333;
    line-height: 1.6;
    margin: 0 0 16px;
  }
  .mf-description p {
    margin: 0 0 12px;
    line-height: 1.6;
  }
  .mf-description p:last-child {
    margin-bottom: 0;
  }
  .mf-description strong, .mf-description b {
    font-weight: 700;
    color: #111;
  }
  .mf-description em, .mf-description i {
    font-style: italic;
  }
  .mf-description ul {
    list-style-type: disc;
    padding-left: 22px;
    margin: 8px 0 12px;
  }
  .mf-description ol {
    list-style-type: decimal;
    padding-left: 22px;
    margin: 8px 0 12px;
  }
  .mf-description li {
    margin: 4px 0;
    line-height: 1.5;
  }
  .mf-disclaimer {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin: 0 0 20px;
  }
  .mf-required-notice {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #333;
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
  .mf-required-notice .mf-asterisk {
    color: #D13438;
    margin-right: 2px;
  }

  /* ─── Question Block ─── */
  .mf-question {
    padding: 32px 0;
  }
  .mf-question + .mf-question {
    border-top: none;
  }
  .mf-question-label {
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1C1B1F;
    margin: 0 0 12px;
    line-height: 1.4;
  }
  .mf-question-label .mf-asterisk {
    color: #D13438;
    font-weight: 600;
    margin-left: 2px;
  }
  .mf-question-desc {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: #666;
    margin: -6px 0 12px;
    line-height: 1.5;
  }
  .mf-question-desc p {
    margin: 0 0 6px;
    line-height: 1.5;
  }
  .mf-question-desc p:last-child {
    margin-bottom: 0;
  }
  .mf-question-desc strong, .mf-question-desc b {
    font-weight: 700;
    color: #333;
  }
  .mf-question-desc em, .mf-question-desc i {
    font-style: italic;
  }
  .mf-question-desc ul {
    list-style-type: disc;
    padding-left: 20px;
    margin: 4px 0 8px;
  }
  .mf-question-desc ol {
    list-style-type: decimal;
    padding-left: 20px;
    margin: 4px 0 8px;
  }
  .mf-question-desc li {
    margin: 2px 0;
  }

  /* ─── Inputs ─── */
  .mf-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid #D2D0CA;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    color: #1C1B1F;
    padding: 10px 0;
    transition: border-color .2s ease;
  }
  .mf-input::placeholder { color: #B4B2AC; }
  .mf-input:focus { border-bottom-color: #0078D4; }
  .mf-input.mf-input-error { border-bottom-color: #D13438; }

  .mf-textarea {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid #D2D0CA;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    color: #1C1B1F;
    padding: 10px 0;
    transition: border-color .2s ease;
    resize: vertical;
    min-height: 60px;
  }
  .mf-textarea::placeholder { color: #B4B2AC; }
  .mf-textarea:focus { border-bottom-color: #0078D4; }

  /* ─── Option Cards (Radio/Checkbox) ─── */
  .mf-option-card {
    width: 100%;
    background: #FFFFFF;
    border: 1.5px solid #D2D0CA;
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all .15s ease;
  }
  .mf-option-card:hover { border-color: #0078D4; }
  .mf-option-card.selected {
    border-color: #0078D4;
    background: #EFF6FC;
  }
  .mf-option-label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #1C1B1F;
    flex: 1;
  }

  /* ─── Scale ─── */
  .mf-scale-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  .mf-scale-btn {
    width: 48px; height: 48px;
    border-radius: 4px;
    border: 1.5px solid #D2D0CA;
    background: #FFFFFF;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1C1B1F;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s ease;
  }
  .mf-scale-btn:hover { border-color: #0078D4; }
  .mf-scale-btn.active {
    background: #0078D4;
    border-color: #0078D4;
    color: #FFFFFF;
  }

  /* ─── Payment Card ─── */
  .mf-payment-card {
    background: #FAFAFA;
    border: 1.5px solid #D2D0CA;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;
  }
  .mf-payment-amount {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #1C1B1F;
  }

  /* ─── Submit Button ─── */
  .mf-submit-btn {
    background: #0078D4;
    color: #FFFFFF;
    border: none;
    border-radius: 4px;
    padding: 12px 32px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background .15s ease;
    margin-top: 8px;
  }
  .mf-submit-btn:hover:not(:disabled) { background: #106EBE; }
  .mf-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ─── Footer ─── */
  .mf-footer {
    text-align: center;
    padding: 24px 0;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #888;
  }
  .mf-footer a { color: #888; text-decoration: none; }
  .mf-footer a:hover { color: #1C1B1F; text-decoration: underline; }

  /* ─── Success Screen ─── */
  .mf-success-card {
    background: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    padding: 60px 48px;
    text-align: center;
  }
  @media (max-width: 640px) {
    .mf-success-card { padding: 40px 20px; }
  }

  /* ─── Animations ─── */
  @keyframes mfFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mf-fade-in {
    animation: mfFadeIn .4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .mf-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
  }

  /* ─── Validation Error ─── */
  .mf-error-msg {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #D13438;
    margin-top: 4px;
  }

  /* ─── Light Mode Calendar & Dropdown Overrides ─── */
  .mf-light-popover,
  [data-slot="popover-content"].mf-light-popover,
  .mf-light-select,
  [data-slot="select-content"].mf-light-select {
    background-color: #FFFFFF !important;
    background: #FFFFFF !important;
    color: #1C1B1F !important;
    border: 1px solid #D2D0CA !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12) !important;
  }

  .mf-light-select [data-slot="select-item"] {
    color: #1C1B1F !important;
  }
  .mf-light-select [data-slot="select-item"]:hover,
  .mf-light-select [data-slot="select-item"]:focus,
  .mf-light-select [data-slot="select-item"][data-highlighted] {
    background-color: #F3F2F1 !important;
    color: #1C1B1F !important;
  }

  .mf-light-calendar,
  .mf-light-calendar * {
    color: #1C1B1F !important;
  }
  .mf-light-calendar [data-slot="calendar"] {
    background-color: #FFFFFF !important;
    background: #FFFFFF !important;
  }
  .mf-light-calendar .rdp-month_caption {
    color: #1C1B1F !important;
    font-weight: 600 !important;
  }
  .mf-light-calendar .rdp-weekday {
    color: #605E5C !important;
  }
  .mf-light-calendar [data-slot="button"] {
    color: #1C1B1F !important;
  }
  .mf-light-calendar [data-slot="button"]:hover {
    background-color: #F3F2F1 !important;
  }
  .mf-light-calendar [data-selected-single="true"] {
    background-color: #0078D4 !important;
    color: #FFFFFF !important;
    font-weight: 600 !important;
  }
  .mf-light-calendar [data-slot="button"][data-selected-single="true"] {
    background-color: #0078D4 !important;
    color: #FFFFFF !important;
  }
  .mf-light-calendar .rdp-dropdowns,
  .mf-light-calendar [class*="dropdowns"] {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
  }
  .mf-light-calendar .rdp-dropdown_root,
  .mf-light-calendar [class*="dropdown_root"] {
    position: relative !important;
    display: inline-flex !important;
    align-items: center !important;
    border: 1px solid #D2D0CA !important;
    border-radius: 6px !important;
    background-color: #FFFFFF !important;
    padding: 2px 6px !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
  }
  .mf-light-calendar .rdp-dropdown_root:hover,
  .mf-light-calendar [class*="dropdown_root"]:hover {
    background-color: #F3F2F1 !important;
    border-color: #0078D4 !important;
  }
  .mf-light-calendar select,
  .mf-light-calendar .rdp-dropdown,
  .mf-light-calendar [class*="dropdown"] {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    opacity: 0 !important;
    cursor: pointer !important;
    background-color: #FFFFFF !important;
    color: #1C1B1F !important;
    font-size: 13px !important;
    z-index: 10 !important;
  }
  .mf-light-calendar select option {
    background-color: #FFFFFF !important;
    color: #1C1B1F !important;
    padding: 4px 8px !important;
  }
  .mf-light-calendar .rdp-caption_label,
  .mf-light-calendar [class*="caption_label"] {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #1C1B1F !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 2px !important;
  }
  .mf-light-calendar .rdp-nav,
  .mf-light-calendar [class*="nav"] {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    position: absolute !important;
    top: 0px !important;
    left: 0px !important;
    right: 0px !important;
    padding: 0 4px !important;
    height: 32px !important;
    pointer-events: none !important;
    z-index: 10 !important;
  }
  .mf-light-calendar .rdp-button_previous,
  .mf-light-calendar .rdp-button_next,
  .mf-light-calendar [class*="button_previous"],
  .mf-light-calendar [class*="button_next"] {
    pointer-events: auto !important;
    background-color: #FFFFFF !important;
    border: 1px solid #D2D0CA !important;
    border-radius: 6px !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #1C1B1F !important;
    cursor: pointer !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
    transition: all 0.15s ease !important;
    z-index: 20 !important;
  }
  .mf-light-calendar .rdp-button_previous:hover,
  .mf-light-calendar .rdp-button_next:hover,
  .mf-light-calendar [class*="button_previous"]:hover,
  .mf-light-calendar [class*="button_next"]:hover {
    background-color: #F3F2F1 !important;
    border-color: #0078D4 !important;
  }

  /* ─── Closed State ─── */
  .mf-closed-card {
    background: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    padding: 60px 48px;
    text-align: center;
  }
  @media (max-width: 640px) {
    .mf-closed-card { padding: 40px 20px; }
  }

  /* ─── Rich Text Content ─── */
  .mf-rich-text {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #444;
  }
  .mf-rich-text p { margin: 0 0 8px; }
  .mf-rich-text p:last-child { margin-bottom: 0; }
  .mf-rich-text strong { font-weight: 700; color: #1C1B1F; }
  .mf-rich-text em { font-style: italic; }
  .mf-rich-text ul, .mf-rich-text .my-bullet-list, .mf-rich-text .prose-bullet-list, .tiptap-content ul {
    list-style-type: disc !important;
    margin: 8px 0 !important;
    padding-left: 24px !important;
  }
  .mf-rich-text ol, .mf-rich-text .my-ordered-list, .mf-rich-text .prose-ordered-list, .tiptap-content ol {
    list-style-type: decimal !important;
    margin: 8px 0 !important;
    padding-left: 24px !important;
  }
  .mf-rich-text li, .mf-rich-text .my-list-item, .tiptap-content li {
    display: list-item !important;
    margin: 4px 0 !important;
  }
  .mf-rich-text li p, .tiptap-content li p {
    margin: 0 !important;
    display: inline !important;
  }
`;

/* ─── Helpers ─── */
function getBannerGradient(form: PublishedFormResponse): string {
  const templateId = form.definition.bannerTemplate;
  if (!templateId || templateId === "none") {
    return "linear-gradient(135deg, #2dd4bf 0%, #a7f3d0 50%, #bfdbfe 100%)";
  }
  const tpl = BANNER_TEMPLATES.find((t) => t.id === templateId);
  return tpl
    ? tpl.cssGradient
    : "linear-gradient(135deg, #2dd4bf 0%, #a7f3d0 50%, #bfdbfe 100%)";
}

const tiptapExtensions = [
  StarterKit.configure({
    bulletList: false,
    orderedList: false,
    listItem: false,
  }),
  ListItem.configure({
    HTMLAttributes: {
      class: "my-list-item",
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: "my-bullet-list",
    },
    itemTypeName: "listItem",
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "my-ordered-list",
    },
    itemTypeName: "listItem",
  }),
  TextAlign.configure({
    types: ["heading", "paragraph", "listItem"],
  }),
];

function hasListNodes(json: any): boolean {
  if (!json || typeof json !== "object") return false;
  if (json.type === "bulletList" || json.type === "orderedList") return true;
  if (Array.isArray(json.content)) {
    return json.content.some(hasListNodes);
  }
  return false;
}

function extractPlainTextFromJson(json: any): string {
  if (!json) return "";
  if (typeof json === "string") return json;
  if (json.text && typeof json.text === "string") return json.text;
  if (Array.isArray(json.content)) {
    return json.content.map(extractPlainTextFromJson).join(" ");
  }
  return "";
}

function autoFormatDescriptionText(text: string): string {
  if (!text) return "";

  if (text.includes("📌") || /important:/i.test(text)) {
    const parts = text.split(/(📌\s*Important:?|Important:)/i);
    if (parts.length >= 3) {
      const intro = parts[0].trim();
      const header = parts[1].trim();
      const rest = parts.slice(2).join("").trim();

      const rawSentences = rest
        .split(/(?<=\.)\s+|\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const bulletItems: string[] = [];
      let outro = "";

      for (const sentence of rawSentences) {
        if (/please complete the form/i.test(sentence)) {
          outro = sentence;
        } else {
          const cleanSentence = sentence.replace(/^[•*\-\s]+/, "").trim();
          if (cleanSentence) bulletItems.push(cleanSentence);
        }
      }

      let html = "";
      if (intro) html += `<p>${intro}</p>`;
      if (header)
        html += `<p style="margin-top: 12px; margin-bottom: 6px;"><strong>${header}</strong></p>`;
      if (bulletItems.length > 0) {
        html += `<ul class="my-bullet-list">`;
        for (const item of bulletItems) {
          html += `<li class="my-list-item"><p>${item}</p></li>`;
        }
        html += `</ul>`;
      }
      if (outro)
        html += `<p style="margin-top: 12px;"><strong>${outro}</strong></p>`;

      return html;
    }
  }

  return plainTextToHtml(text);
}

function plainTextToHtml(text: string): string {
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  let html = "";
  let inBulletList = false;
  let inOrderedList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inBulletList) {
        html += "</ul>";
        inBulletList = false;
      }
      if (inOrderedList) {
        html += "</ol>";
        inOrderedList = false;
      }
      continue;
    }

    const bulletMatch = line.match(/^(?:[•*\-]|&bull;)\s+(.*)/);
    const orderedMatch = line.match(/^\d+[\.\)]\s+(.*)/);

    if (bulletMatch) {
      if (inOrderedList) {
        html += "</ol>";
        inOrderedList = false;
      }
      if (!inBulletList) {
        html += '<ul class="my-bullet-list">';
        inBulletList = true;
      }
      html += `<li class="my-list-item"><p>${bulletMatch[1]}</p></li>`;
    } else if (orderedMatch) {
      if (inBulletList) {
        html += "</ul>";
        inBulletList = false;
      }
      if (!inOrderedList) {
        html += '<ol class="my-ordered-list">';
        inOrderedList = true;
      }
      html += `<li class="my-list-item"><p>${orderedMatch[1]}</p></li>`;
    } else {
      if (inBulletList) {
        html += "</ul>";
        inBulletList = false;
      }
      if (!inOrderedList) {
        html += "</ol>";
        inOrderedList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  if (inBulletList) html += "</ul>";
  if (inOrderedList) html += "</ol>";

  return html || `<p>${text}</p>`;
}

/** Render Tiptap JSON or plain text as React elements */
function renderRichText(value: string | null | undefined, className?: string) {
  if (!value) return null;
  try {
    const json = JSON.parse(value);
    if (json && typeof json === "object" && (json.type || json.content)) {
      const html = generateHTML(json, tiptapExtensions);
      return (
        <div className={`mf-rich-text ${className || ""}`}>
          {parse(html)}
        </div>
      );
    }
  } catch {
    // Not JSON — convert plain text to HTML with paragraph and list tags
  }
  const fallbackHtml = autoFormatDescriptionText(value);
  return (
    <div className={`mf-rich-text ${className || ""}`}>
      {parse(fallbackHtml)}
    </div>
  );
}

export default function PublicForm({ form }: PublicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    previousResponseId: string;
    referenceNumber: string;
    message: string;
    submittedAt?: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | Record<string, string>>
  >({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ─── Draft Restore ───
  useEffect(() => {
    try {
      const draftKey = `public_form_draft_${form.formId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.transactionId) setTransactionId(parsed.transactionId);
        if (parsed.answers && typeof parsed.answers === "object")
          setAnswers(parsed.answers);
        toast.info("Restored your saved form responses from last session.", {
          duration: 4000,
        });
      }
    } catch {
      // ignore storage error
    }
  }, [form.formId]);

  // ─── Auto-Save Draft ───
  useEffect(() => {
    if (success) return;
    try {
      const draftKey = `public_form_draft_${form.formId}`;
      localStorage.setItem(
        draftKey,
        JSON.stringify({ name, email, transactionId, answers }),
      );
    } catch {
      // ignore storage error
    }
  }, [form.formId, name, email, transactionId, answers, success]);

  const allFields = useMemo(
    () => form.definition.sections.flatMap((s) => s.fields),
    [form],
  );
  const paymentField = useMemo(
    () => allFields.find((f) => f.type === "payment") || null,
    [allFields],
  );

  const firstName = name.split(" ")[0] || "there";

  /* ─── Answer Helpers ─── */
  const updateAnswer = (
    id: string,
    val: string | string[] | Record<string, string>,
  ) => {
    setAnswers((c) => ({ ...c, [id]: val }));
    setTouched((c) => ({ ...c, [id]: true }));
  };

  const toggleCheckbox = (id: string, opt: string) => {
    const cur = (answers[id] as string[] | undefined) || [];
    updateAnswer(
      id,
      cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt],
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
    const amountParam =
      paymentField.paymentAmount !== undefined
        ? `&am=${paymentField.paymentAmount}`
        : "";
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      paymentField.upiId,
    )}&pn=${encodeURIComponent(payee)}${amountParam}&cu=INR`;
    copyToClipboard(paymentField.upiId, "UPI ID");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    );
    if (isMobile) {
      toast.success("Opening UPI payment app...");
      window.location.href = upiUrl;
    } else {
      toast.info(
        `UPI ID (${paymentField.upiId}) copied! Scan the QR code with GPay/PhonePe or open your app to pay ₹${paymentField.paymentAmount ?? 0}.`,
        { duration: 5000 },
      );
      try {
        window.location.href = upiUrl;
      } catch {
        // Suppress browser scheme error on desktop
      }
    }
  };

  /* ─── Validation ─── */
  const isFieldValid = (field: FormFieldDefinition): boolean => {
    if (field.type === "multi_input") {
      if (!field.required) return true;
      const valObj =
        (answers[field.id] as Record<string, string> | undefined) || {};
      const subQuestions = field.subQuestions || [];
      for (const sub of subQuestions) {
        if (sub.required && !valObj[sub.id]?.trim()) return false;
      }
      return true;
    }
    if (!field.required) return true;
    if (field.type === "payment") return Boolean(transactionId.trim());
    if (field.type === "button") return true;
    if (field.type === "file_upload") {
      const files = answers[field.id];
      return Array.isArray(files) && files.length > 0;
    }
    const val = answers[field.id];
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(typeof val === "string" && val.trim());
  };

  const validateAll = (): boolean => {
    let valid = true;
    if (form.definition.settings.collectName && !name.trim()) valid = false;
    if (
      form.definition.settings.collectEmail &&
      (!email.trim() || !email.includes("@"))
    )
      valid = false;
    for (const field of allFields) {
      if (!isFieldValid(field)) valid = false;
    }
    return valid;
  };

  const isFieldError = (fieldId: string, required: boolean): boolean => {
    if (!required) return false;
    if (!submitAttempted && !touched[fieldId]) return false;
    const val = answers[fieldId];
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "object" && val !== null) return false; // multi_input handled separately
    return !val || (typeof val === "string" && !val.trim());
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!validateAll()) {
      toast.error("Please fill in all required fields.");
      return;
    }
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

    if (result.status === "duplicate" || (result as any).isDuplicate) {
      setDuplicateInfo({
        previousResponseId: (result as any).previousResponseId || (result as any).data?.id || "",
        referenceNumber: (result as any).referenceNumber || (result as any).data?.referenceNumber || "",
        message: result.message || "A submission with this email has already been recorded.",
        submittedAt: (result as any).data?.submittedAt,
      });
      toast.warning(result.message);
    } else if (result.status === "success") {
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

  const bannerGradient = getBannerGradient(form);
  const bannerImage = form.definition.bannerKey
    ? getImageUrl(form.definition.bannerKey)
    : null;
  const hasAnyRequired =
    allFields.some((f) => f.required) ||
    form.definition.settings.collectName ||
    form.definition.settings.collectEmail;

  /* ─── Build numbered questions ─── */
  let questionNum = 0;

  /* ═══ RENDER: DUPLICATE / ALREADY SUBMITTED ═══ */
  if (duplicateInfo) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS }} />
        <div className="mf-page" style={{ background: "#F3F2F1" }}>
          <div
            className="mf-banner"
            style={{
              background: bannerImage ? undefined : bannerGradient,
            }}
          >
            {bannerImage && (
              <Image
                src={bannerImage}
                alt=""
                fill
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div className="mf-container">
            <div className="mf-success-card mf-fade-in" style={{ borderColor: "#E0A800" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#FFF8E1",
                  border: "2px solid #F59E0B",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Ban style={{ width: 28, height: 28, strokeWidth: 2.5 }} />
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#D97706",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Already Submitted
              </p>

              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: "#1C1B1F",
                  marginBottom: 12,
                }}
              >
                Response Already Recorded
              </h1>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                  maxWidth: 480,
                  margin: "0 auto 24px",
                }}
              >
                {duplicateInfo.message}
              </p>

              {/* Previous Response Details Box */}
              <div
                style={{
                  background: "#F9F9F8",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  padding: "16px 20px",
                  maxWidth: 440,
                  margin: "0 auto 28px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>Form</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1C1B1F" }}>{form.title}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>Previous Response ID</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#1C1B1F" }}>
                    {duplicateInfo.referenceNumber || `#${duplicateInfo.previousResponseId.slice(0, 8).toUpperCase()}`}
                  </span>
                </div>
                {duplicateInfo.submittedAt && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>Submitted On</span>
                    <span style={{ fontSize: 12, color: "#444" }}>
                      {new Date(duplicateInfo.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                
                <button
                  type="button"
                  onClick={() => setDuplicateInfo(null)}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #D1D5DB",
                    color: "#374151",
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Dismiss / Review Answers
                </button>
              </div>

              <div
                style={{
                  marginTop: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#FFF",
                    border: "1px solid #e8e8e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Codebreakers"
                    width={36}
                    height={36}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1C1B1F",
                  }}
                >
                  Codebreakers
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═══ RENDER: SUCCESS ═══ */
  if (success) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: FORM_CSS }} />
        <div className="mf-page" style={{ background: "#F3F2F1" }}>
          <div
            className="mf-banner"
            style={{
              background: bannerImage ? undefined : bannerGradient,
            }}
          >
            {bannerImage && (
              <Image
                src={bannerImage}
                alt=""
                fill
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div className="mf-container">
            <div className="mf-success-card mf-fade-in">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#107C10",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Check style={{ width: 28, height: 28, strokeWidth: 3 }} />
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#107C10",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Submission Complete
              </p>

              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(24px, 4vw, 34px)",
                  fontWeight: 700,
                  color: "#1C1B1F",
                  marginBottom: 12,
                }}
              >
                You&apos;re in, {firstName}!
              </h1>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "#666",
                  lineHeight: 1.6,
                  maxWidth: 440,
                  margin: "0 auto 32px",
                }}
              >
                {form.definition.settings.successMessage ||
                  `Confirmation sent to ${email || "your email"}. See you at Codebreakers.`}
              </p>

              <div
                style={{
                  marginTop: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Codebreakers"
                    width={36}
                    height={36}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 25,
                    fontWeight: 600,
                    color: "#1C1B1F",
                  }}
                >
                  CodeBreakers
                </span>
              </div>
            </div>
          </div>

          <div className="mf-footer">
            <a href="https://codebreakersgcek.tech/privacy">Privacy Policy</a>
            <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
            Powered by <strong>CodeBreakers</strong>
          </div>
        </div>
      </>
    );
  }

  /* ═══ RENDER: FORM ═══ */
  const renderField = (field: FormFieldDefinition, qNumber: number) => {
    const fieldError = isFieldError(field.id, field.required);

    if (field.type === "button") {
      return (
        <div className="mf-question mf-fade-in" key={field.id}>
          <p className="mf-question-label">
            {qNumber}. {field.label}
          </p>
          {field.description &&
            renderRichText(field.description, "mf-question-desc")}
          <button
            type="button"
            className="mf-submit-btn"
            style={{ background: "#1F4D3D" }}
            onClick={() => {
              if (!field.buttonUrl) return;
              field.buttonOpenInNewTab
                ? window.open(field.buttonUrl, "_blank", "noopener,noreferrer")
                : (window.location.href = field.buttonUrl);
            }}
          >
            {field.buttonLabel || "Open link"}{" "}
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      );
    }

    if (field.type === "payment") {
      const payErr = submitAttempted && !transactionId.trim();
      return (
        <div className="mf-question mf-fade-in" key={field.id}>
          <p className="mf-question-label">
            {qNumber}. {field.label}
            <span className="mf-asterisk">*</span>
          </p>
          {field.description &&
            renderRichText(field.description, "mf-question-desc")}

          <div className="mf-payment-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Amount Due
              </span>
              <span className="mf-payment-amount">
                ₹{field.paymentAmount ?? 0}
              </span>
            </div>
            {field.upiId && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 180,
                    height: 180,
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
                      `upi://pay?pa=${field.upiId}&pn=${encodeURIComponent(
                        field.payeeName || form.title,
                      )}${field.paymentAmount !== undefined ? `&am=${field.paymentAmount}` : ""}&cu=INR`,
                    )}`}
                    alt="UPI QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#888" }}>UPI:</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {field.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(field.upiId!, "UPI ID")}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      color: "#888",
                    }}
                    title="Copy UPI ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={openUpi}
                    style={{
                      background: "#0078D4",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CreditCard className="h-4 w-4" /> Pay Now
                  </button>
                </div>
              </div>
            )}
          </div>

          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            {field.transactionIdLabel || "Transaction ID"}{" "}
            <span style={{ color: "#D13438" }}>*</span>
          </label>
          <input
            className={`mf-input${payErr ? " mf-input-error" : ""}`}
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Paste transaction ID..."
          />
          {payErr && <p className="mf-error-msg">This field is required</p>}
        </div>
      );
    }

    return (
      <div className="mf-question mf-fade-in" key={field.id}>
        <p className="mf-question-label">
          {qNumber}. {field.label}
          {field.required && <span className="mf-asterisk">*</span>}
        </p>
        {field.description &&
          renderRichText(field.description, "mf-question-desc")}

        {field.imageKey && (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 16,
              border: "1px solid #e8e8e8",
            }}
          >
            <Image
              src={getImageUrl(field.imageKey)}
              alt=""
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        {/* Short Text / Email / Number */}
        {(field.type === "short_text" ||
          field.type === "email" ||
          field.type === "number") && (
          <div>
            <input
              className={`mf-input${fieldError ? " mf-input-error" : ""}`}
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "number"
                    ? "number"
                    : "text"
              }
              value={(answers[field.id] as string) || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              placeholder={field.placeholder || "Enter your answer"}
            />
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Long Text */}
        {field.type === "long_text" && (
          <div>
            <textarea
              className={`mf-textarea${fieldError ? " mf-input-error" : ""}`}
              rows={3}
              value={(answers[field.id] as string) || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              placeholder={field.placeholder || "Enter your answer"}
            />
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Multi Input */}
        {field.type === "multi_input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {(field.subQuestions || []).map((sub, idx) => {
              const currentValObj =
                (answers[field.id] as Record<string, string> | undefined) || {};
              const subVal = currentValObj[sub.id] || "";
              const isSubRequired = Boolean(field.required && sub.required);
              const subErr =
                (submitAttempted || touched[field.id]) &&
                isSubRequired &&
                !subVal.trim();
              return (
                <div key={sub.id || idx}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1C1B1F",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {sub.label || `Sub-question ${idx + 1}`}
                    {isSubRequired && (
                      <span style={{ color: "#D13438", marginLeft: 2 }}>*</span>
                    )}
                  </label>
                  <input
                    className={`mf-input${subErr ? " mf-input-error" : ""}`}
                    type="text"
                    value={subVal}
                    onChange={(e) => {
                      const updated = {
                        ...currentValObj,
                        [sub.id]: e.target.value,
                      };
                      updateAnswer(field.id, updated);
                    }}
                    placeholder={sub.placeholder || "Enter your answer"}
                  />
                  {subErr && (
                    <p className="mf-error-msg">This field is required</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Linear Scale */}
        {field.type === "linear_scale" && (
          <div>
            <div className="mf-scale-grid">
              {Array.from(
                { length: (field.scaleMax ?? 5) - (field.scaleMin ?? 1) + 1 },
                (_, idx) => (field.scaleMin ?? 1) + idx,
              ).map((num) => {
                const selected = answers[field.id] === String(num);
                return (
                  <button
                    key={num}
                    type="button"
                    className={`mf-scale-btn ${selected ? "active" : ""}`}
                    onClick={() => updateAnswer(field.id, String(num))}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            {(field.scaleMinLabel || field.scaleMaxLabel) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#888",
                  marginTop: 6,
                }}
              >
                <span>{field.scaleMinLabel || ""}</span>
                <span>{field.scaleMaxLabel || ""}</span>
              </div>
            )}
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Radio */}
        {field.type === "radio" && (
          <div>
            <RadioGroup
              value={(answers[field.id] as string) || ""}
              onValueChange={(opt) => updateAnswer(field.id, opt)}
            >
              {(field.options || ["Option 1"]).map((opt) => {
                const selected = answers[field.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`mf-option-card ${selected ? "selected" : ""}`}
                  >
                    <RadioGroupItem
                      value={opt}
                      className="h-4 w-4 border-2 border-[#D2D0CA] text-[#0078D4]"
                    />
                    <span className="mf-option-label">{opt}</span>
                  </label>
                );
              })}
            </RadioGroup>
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Checkbox */}
        {field.type === "checkbox" && (
          <div>
            {(field.options || ["Option 1"]).map((opt) => {
              const cur = (answers[field.id] as string[]) || [];
              const selected = cur.includes(opt);
              return (
                <div
                  key={opt}
                  className={`mf-option-card ${selected ? "selected" : ""}`}
                  onClick={() => toggleCheckbox(field.id, opt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      toggleCheckbox(field.id, opt);
                  }}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleCheckbox(field.id, opt)}
                    className="h-4 w-4 rounded border-2 border-[#D2D0CA] data-[state=checked]:bg-[#0078D4] data-[state=checked]:border-[#0078D4]"
                  />
                  <span className="mf-option-label">{opt}</span>
                </div>
              );
            })}
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Dropdown */}
        {field.type === "dropdown" && (
          <div>
            <Select
              value={(answers[field.id] as string) || ""}
              onValueChange={(val) => updateAnswer(field.id, val)}
            >
              <SelectTrigger
                className={`w-auto min-w-[220px] h-11 !bg-white border-[1.5px] ${fieldError ? "!border-[#D13438]" : "!border-[#D2D0CA]"} rounded text-sm !text-[#1C1B1F] focus:!border-[#0078D4] focus:!ring-0 shadow-none`}
              >
                <SelectValue placeholder="Choose an option..." />
              </SelectTrigger>
              <SelectContent className="mf-light-select rounded-lg border border-[#D2D0CA] !bg-white !text-[#1C1B1F] shadow-xl z-50 p-1">
                {(field.options || []).map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-sm py-2 px-3 cursor-pointer !text-[#1C1B1F] hover:!bg-[#F3F2F1] focus:!bg-[#F3F2F1] focus:!text-[#1C1B1F] rounded-md transition-colors"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* Date */}
        {field.type === "date" && (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`mf-input text-left flex items-center justify-between cursor-pointer${fieldError ? " mf-input-error" : ""}`}
                  style={{ maxWidth: 260 }}
                >
                  <span
                    style={{ color: answers[field.id] ? "#1C1B1F" : "#B4B2AC" }}
                  >
                    {answers[field.id]
                      ? format(new Date(answers[field.id] as string), "PPP")
                      : "Pick a date..."}
                  </span>
                  <CalendarIcon className="h-4 w-4" style={{ color: "#888" }} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="mf-light-popover w-auto p-0 rounded-xl shadow-xl !bg-white !text-[#1C1B1F] border border-[#D2D0CA] z-50 overflow-hidden"
                align="start"
              >
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  startMonth={new Date(1920, 0)}
                  endMonth={new Date(new Date().getFullYear() + 20, 11)}
                  defaultMonth={
                    answers[field.id]
                      ? new Date(answers[field.id] as string)
                      : new Date()
                  }
                  selected={
                    answers[field.id]
                      ? new Date(answers[field.id] as string)
                      : undefined
                  }
                  onSelect={(day) => {
                    if (day)
                      updateAnswer(field.id, day.toISOString().split("T")[0]);
                  }}
                  className="mf-light-calendar !bg-white !text-[#1C1B1F] p-3"
                  classNames={{
                    months: "flex flex-col sm:flex-row gap-2 relative",
                    month_caption: "flex items-center justify-center h-8 w-full text-sm font-semibold !text-[#1C1B1F] px-10 mb-1",
                    dropdowns: "flex items-center justify-center gap-1.5",
                    dropdown_root: "relative inline-flex items-center border border-[#D2D0CA] rounded-md bg-white px-2 py-1 cursor-pointer hover:border-[#0078D4] hover:bg-[#F3F2F1]",
                    dropdown: "absolute inset-0 opacity-0 cursor-pointer w-full h-full bg-white text-[#1C1B1F] z-10",
                    caption_label: "text-xs font-semibold !text-[#1C1B1F] flex items-center gap-1",
                    nav: "flex items-center justify-between w-full absolute top-0 inset-x-0 px-1 h-8 pointer-events-none z-10",
                    button_previous: "!bg-white hover:!bg-[#F3F2F1] !text-[#1C1B1F] border border-[#D2D0CA] rounded-lg h-7 w-7 p-0 flex items-center justify-center shrink-0 pointer-events-auto shadow-xs transition-colors",
                    button_next: "!bg-white hover:!bg-[#F3F2F1] !text-[#1C1B1F] border border-[#D2D0CA] rounded-lg h-7 w-7 p-0 flex items-center justify-center shrink-0 pointer-events-auto shadow-xs transition-colors",
                    weekdays: "flex border-b border-[#F3F2F1] pb-1",
                    weekday: "!text-[#605E5C] text-xs font-medium w-9 text-center",
                    day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    today: "!bg-[#F3F2F1] !text-[#0078D4] font-bold rounded-lg",
                    outside: "!text-[#A19F9D] opacity-40",
                    disabled: "!text-[#C8C6C4] opacity-30",
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {fieldError && (
              <p className="mf-error-msg">This field is required</p>
            )}
          </div>
        )}

        {/* File Upload */}
        {field.type === "file_upload" && (
          <div>
            <FormFileUploader
              fieldId={field.id}
              label={field.label}
              description={field.description}
              required={field.required}
              allowedFileTypes={field.allowedFileTypes}
              maxFiles={field.maxFiles}
              imageOnly={field.imageOnly}
              multipleFiles={field.multipleFiles}
              value={(answers[field.id] as unknown as ProcessedFormFile[]) || []}
              onChange={(files) => updateAnswer(field.id, files as any)}
              disabled={isSubmitting}
            />
            {fieldError && (
              <p className="mf-error-msg" style={{ marginTop: 6 }}>
                This field is required
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FORM_CSS }} />

      <div className="mf-page" style={{ background: "#F3F2F1" }}>
        {/* ─── Gradient Banner ─── */}
        <div
          className="mf-banner"
          style={{
            background: bannerImage ? undefined : bannerGradient,
          }}
        >
          {bannerImage && (
            <Image
              src={bannerImage}
              alt=""
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          )}
        </div>

        {/* ─── Form Card ─── */}
        <div className="mf-container">
          <div className="mf-card mf-fade-in">
            {/* Form Title */}
            {form.title && <h1 className="mf-title">{form.title}</h1>}

            {/* Form Description */}
            {form.description &&
              renderRichText(form.description, "mf-description")}

            {!form.acceptingResponses ? (
              /* ─── Closed State ─── */
              <div style={{ paddingTop: 24, textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#FDE8E8",
                    color: "#D13438",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Ban style={{ width: 28, height: 28 }} />
                </div>
                <h2
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "clamp(18px, 3vw, 24px)",
                    fontWeight: 700,
                    color: "#1C1B1F",
                    marginBottom: 8,
                  }}
                >
                  This form is no longer accepting responses
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.6,
                    maxWidth: 400,
                    margin: "0 auto",
                  }}
                >
                  The form owner has closed this form for new submissions. If
                  you believe this is a mistake, please contact the form
                  creator.
                </p>
              </div>
            ) : (
              /* ─── Active Form ─── */
              <>
                {/* Disclaimer text */}
                <p className="mf-disclaimer">
                  When you submit this form, it will not automatically collect
                  your details like name and email address unless you provide it
                  yourself.
                </p>

                {/* Required notice */}
                {hasAnyRequired && (
                  <p className="mf-required-notice">
                    <span className="mf-asterisk">*</span> Required
                  </p>
                )}

                {/* ─── Name Field ─── */}
                {form.definition.settings.collectName &&
                  (() => {
                    questionNum++;
                    const nameErr =
                      (submitAttempted || touched["__name"]) && !name.trim();
                    return (
                      <div className="mf-question mf-fade-in">
                        <p className="mf-question-label">
                          {questionNum}. NAME{" "}
                          <span className="mf-asterisk">*</span>
                        </p>
                        <input
                          className={`mf-input${nameErr ? " mf-input-error" : ""}`}
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setTouched((c) => ({ ...c, __name: true }));
                          }}
                          placeholder="Enter your answer"
                        />
                        {nameErr && (
                          <p className="mf-error-msg">This field is required</p>
                        )}
                      </div>
                    );
                  })()}

                {/* ─── Email Field ─── */}
                {form.definition.settings.collectEmail &&
                  (() => {
                    questionNum++;
                    const emailErr =
                      (submitAttempted || touched["__email"]) &&
                      (!email.trim() || !email.includes("@"));
                    return (
                      <div className="mf-question mf-fade-in">
                        <p className="mf-question-label">
                          {questionNum}. Email{" "}
                          <span className="mf-asterisk">*</span>
                        </p>
                        <input
                          className={`mf-input${emailErr ? " mf-input-error" : ""}`}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setTouched((c) => ({ ...c, __email: true }));
                          }}
                          placeholder="Enter your answer"
                        />
                        {emailErr && (
                          <p className="mf-error-msg">
                            Please enter a valid email address
                          </p>
                        )}
                      </div>
                    );
                  })()}

                {/* ─── Section Fields ─── */}
                {form.definition.sections.map((section, sIdx) => {
                  const showSectionHeader =
                    form.definition.sections.length > 1 ||
                    (section.title && section.title !== "Section 1") ||
                    !!section.description;

                  return (
                    <div key={section.id}>
                      {showSectionHeader && (
                        <div style={{ marginTop: 24, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                          {section.title && (
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "#1C1B1F" }}>
                              {section.title}
                            </h2>
                          )}
                          {section.description &&
                            renderRichText(section.description, "mf-description")}
                        </div>
                      )}
                      {section.fields.map((field) => {
                        questionNum++;
                        return renderField(field, questionNum);
                      })}
                    </div>
                  );
                })}

                {/* ─── Submit Button ─── */}
                <div style={{ paddingTop: 16 }}>
                  <button
                    type="button"
                    className="mf-submit-btn"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" /> Submitting…
                      </>
                    ) : (
                      <>
                        {form.definition.settings.submitButtonLabel || "Submit"}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className="mf-footer">
            <a href="/privacy">Privacy Policy</a>
            <span style={{ margin: "0 8px", color: "#ccc" }}>·</span>
            Powered by <strong>Codebreakers</strong>
          </div>
        </div>
      </div>
    </>
  );
}
