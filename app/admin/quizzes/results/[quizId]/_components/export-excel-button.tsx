"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export interface RankedAttemptItem {
  id: string;
  participantName: string;
  participantEmail: string;
  setLetter: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  status: string;
  tabSwitches: number;
  createdAt: string | Date;
  isPublished: boolean;
  isQualified?: boolean;
  resultStatus?: string;
}

interface ExportExcelButtonProps {
  quizTitle: string;
  quizId: string;
  attempts: RankedAttemptItem[];
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ExportExcelButton({
  quizTitle,
  quizId,
  attempts,
  variant = "outline",
  size = "default",
  className = "",
}: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = () => {
    if (!attempts || attempts.length === 0) {
      toast.error("No attempts available to export");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Sort top to bottom: Highest score first, tie-break with points, correct answers, and earlier submission
      const sorted = [...attempts].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.pointsEarned !== a.pointsEarned) return b.pointsEarned - a.pointsEarned;
        if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // 2. Prepare tabular data with 1-based ranks
      const worksheetData = sorted.map((att, idx) => ({
        "Rank": idx + 1,
        "Participant Name": att.participantName || "N/A",
        "Email Address": att.participantEmail || "N/A",
        "Quiz Set": `Set ${att.setLetter || "A"}`,
        "Score (%)": `${att.score.toFixed(1)}%`,
        "Correct Answers": att.correctAnswers,
        "Total Questions": att.totalQuestions,
        "Points Awarded": att.pointsEarned,
        "Result Status": att.resultStatus || (att.score >= 50 ? "QUALIFIED" : "FAILED"),
        "Exam State": att.status || "Completed",
        "Tab Violations": att.tabSwitches || 0,
        "Submitted At": new Date(att.createdAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        "Result Published": att.isPublished ? "Yes" : "No",
      }));

      // 3. Create Workbook & Sheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Auto-fit column widths
      worksheet["!cols"] = [
        { wch: 8 },  // Rank
        { wch: 26 }, // Name
        { wch: 32 }, // Email
        { wch: 10 }, // Set
        { wch: 12 }, // Score
        { wch: 16 }, // Correct
        { wch: 16 }, // Total Q
        { wch: 16 }, // Points
        { wch: 20 }, // Result Status
        { wch: 14 }, // Exam State
        { wch: 15 }, // Violations
        { wch: 24 }, // Submitted At
        { wch: 16 }, // Published
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ranked Results");

      // 4. Download file
      const safeTitle = (quizTitle || "Quiz").replace(/[^a-zA-Z0-9_-]/g, "_");
      XLSX.writeFile(workbook, `${safeTitle}_Ranked_Results.xlsx`);

      toast.success(`Exported ${sorted.length} ranked results to Excel!`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel file");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExportExcel}
      disabled={isExporting || attempts.length === 0}
      className={`cursor-pointer font-medium ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
      )}
      <span>Export Excel ({attempts.length})</span>
    </Button>
  );
}
