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
  questionsBySet?: Record<string, QuizQuestion[]>;
}

async function loadImageAsBase64(imagePath: string): Promise<string> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error loading image: ${imagePath}`, error);
    return '';
  }
}

async function addHeader(pdf: jsPDF, pageWidth: number, yPosition: number): Promise<number> {
  const logoHeight = 15;
  const logoWidth = 15;
  const margin = 20;

  try {
    // Load both logos
    const gcekLogo = await loadImageAsBase64('/assets/gcek_logo.png');
    const cbLogo = await loadImageAsBase64('/assets/logo.png');

    // Add GCEK logo on the left
    if (gcekLogo) {
      pdf.addImage(gcekLogo, 'PNG', margin, yPosition, logoWidth, logoHeight);
    }

    // Add CodeBreakers heading in the center
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CodeBreakers', pageWidth / 2, yPosition + 10, { align: 'center' });

    // Add CodeBreakers logo on the right
    if (cbLogo) {
      pdf.addImage(cbLogo, 'PNG', pageWidth - margin - logoWidth, yPosition, logoWidth, logoHeight);
    }

    return yPosition + logoHeight + 10;
  } catch (error) {
    console.error('Error adding header:', error);
    // Return position with just text header if images fail
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CodeBreakers', pageWidth / 2, yPosition + 10, { align: 'center' });
    return yPosition + 20;
  }
}

export async function generateQuizPDF(data: QuizPDFData): Promise<Blob> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = 10;

  // Add header with logos
  yPosition = await addHeader(pdf, pageWidth, yPosition);
  yPosition += 5;

  // Add horizontal line after header
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Add title
  pdf.setFontSize(16);
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
  
  // Function to render questions
  const renderQuestions = (questions: QuizQuestion[], setLabel?: string) => {
    // Add set header if this is a grouped export
    if (setLabel) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 139); // Dark blue
      pdf.text(setLabel, margin, yPosition);
      pdf.setTextColor(0, 0, 0); // Reset to black
      yPosition += 10;
      
      // Add separator line after set header
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(0, 0, 139);
      pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
      pdf.setDrawColor(0, 0, 0);
      yPosition += 5;
    }
    
    questions.forEach((question, index) => {
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
      if (index < questions.length - 1) {
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin + 10, yPosition - 5, pageWidth - margin - 10, yPosition - 5);
      }
    });
    
    // Add extra space after set
    if (setLabel) {
      yPosition += 10;
    }
  };

  // Render questions - either grouped by set or as a single list
  if (data.questionsBySet) {
    // Export with sets grouped
    const sortedSets = Object.keys(data.questionsBySet).sort();
    sortedSets.forEach((setKey) => {
      renderQuestions(data.questionsBySet![setKey], `Set ${setKey}`);
    });
  } else {
    // Export single set or flat list
    renderQuestions(data.questions);
  }
  
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
