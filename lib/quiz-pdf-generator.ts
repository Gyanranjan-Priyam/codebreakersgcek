import jsPDF from 'jspdf';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

interface QuizPDFData {
  title: string;
  quizId: string;
  description: string;
  duration: number;
  setNumber?: string;
  questions: QuizQuestion[];
}

export async function generateQuizPDF(data: QuizPDFData): Promise<Blob> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = 20;

  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  
  // Add set number if available
  if (data.setNumber) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Set ${data.setNumber}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  }
  
  // Add quiz ID and duration
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Quiz ID: ${data.quizId} | Duration: ${data.duration} minutes`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  // Add horizontal line
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 10;
  
  // Add description if available
  if (data.description) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(data.description, contentWidth);
    pdf.text(descLines, margin, yPosition);
    yPosition += (descLines.length * 6) + 10;
  }
  
  // Add questions
  data.questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Question number and text
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Q${question.id}.`, margin, yPosition);
    
    const questionText = pdf.splitTextToSize(question.question, contentWidth - 15);
    pdf.text(questionText, margin + 10, yPosition);
    yPosition += (questionText.length * 6) + 4;
    
    // Options
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    question.options.forEach((option, optIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
      const isCorrectAnswer = option === question.answer;
      
      if (isCorrectAnswer) {
        pdf.setFont('helvetica', 'bold');
      }
      
      const optionText = pdf.splitTextToSize(`${optionLabel}. ${option}`, contentWidth - 20);
      pdf.text(optionText, margin + 15, yPosition);
      
      if (isCorrectAnswer) {
        // Add checkmark or indicator for correct answer
        pdf.setTextColor(0, 128, 0); // Green color
        pdf.text('✓', margin + 5, yPosition);
        pdf.setTextColor(0, 0, 0); // Reset to black
        pdf.setFont('helvetica', 'normal');
      }
      
      yPosition += (optionText.length * 5) + 3;
    });
    
    // Add correct answer text
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 128, 0);
    pdf.text(`Correct Answer: ${question.answer}`, margin + 15, yPosition);
    pdf.setTextColor(0, 0, 0);
    
    yPosition += 12;
    
    // Add separator line between questions
    if (index < data.questions.length - 1) {
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin + 10, yPosition - 5, pageWidth - margin - 10, yPosition - 5);
    }
  });
  
  // Add footer on all pages
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.setTextColor(0, 0, 0);
  }
  
  return pdf.output('blob');
}

export function downloadQuizPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
