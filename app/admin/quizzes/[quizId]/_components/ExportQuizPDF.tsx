"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateQuizPDF, downloadQuizPDF } from "@/lib/quiz-pdf-generator";
import { useState } from "react";
import { toast } from "sonner";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

interface ExportQuizPDFProps {
  quizTitle: string;
  quizId: string;
  description: string;
  duration: number;
  setNumber?: string;
  questions: QuizQuestion[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  stopPropagation?: boolean;
}

export function ExportQuizPDF({
  quizTitle,
  quizId,
  description,
  duration,
  setNumber,
  questions,
  variant = "outline",
  size = "sm",
  className,
  stopPropagation = false
}: ExportQuizPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    
    try {
      setIsExporting(true);
      
      const pdfBlob = await generateQuizPDF({
        title: quizTitle,
        quizId,
        description,
        duration,
        setNumber,
        questions,
      });
      
      const filename = setNumber 
        ? `${quizId}_Set_${setNumber}.pdf`
        : `${quizId}_Quiz.pdf`;
      
      downloadQuizPDF(pdfBlob, filename);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
