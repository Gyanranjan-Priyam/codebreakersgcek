import jsPDF from 'jspdf';

interface InvoiceDetails {
  invoiceNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  collegeName: string;
  state: string;
  district: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationId: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentVerifiedDate: Date;
  transactionId?: string;
  paymentMethod: string;
}

export async function generateInvoicePDF(details: InvoiceDetails): Promise<Buffer> {
  const pdf = new jsPDF();
  

  const primaryColor: [number, number, number] = [41, 98, 255]; // Professional blue
  const darkText: [number, number, number] = [33, 33, 33];
  const grayText: [number, number, number] = [102, 102, 102];
  const lightGray: [number, number, number] = [189, 189, 189];
  const borderColor: [number, number, number] = [229, 229, 229];

  const margin = 25;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  
  // Header Section
  let yPos = margin;
  
  // Company Name - Left Side
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text('CodeBreakers 2025', margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  pdf.text('Government College of Engineering Kalahandi', margin, yPos);
  
  // Company Details - Right Side
  const rightX = pageWidth - margin;
  let rightY = margin;
  
  pdf.setFontSize(9);
  pdf.setTextColor(...grayText);
  pdf.text('Bhawanipatna, Kalahandi - 766003', rightX, rightY, { align: 'right' });
  rightY += 5;
  pdf.text('Odisha, India', rightX, rightY, { align: 'right' });
  rightY += 5;
  pdf.text('CodeBreakers.gcekbhawanipatna@gmail.com', rightX, rightY, { align: 'right' });
  rightY += 5;
  pdf.text('+91-XXXXXXXXXX', rightX, rightY, { align: 'right' });
  
  // Divider Line
  yPos = 55;
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  // Invoice Title and Details
  yPos = 70;
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text('INVOICE', margin, yPos);
  
  // Invoice Meta - Right Side
  let metaY = 70;
  const metaLabelX = 120; // Moved left to create more gap
  const metaValueX = rightX;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  pdf.text('Invoice Number', metaLabelX, metaY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text(details.invoiceNumber, metaValueX, metaY, { align: 'right' });
  
  metaY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  pdf.text('Invoice Date', metaLabelX, metaY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text(details.paymentVerifiedDate.toLocaleDateString('en-IN'), metaValueX, metaY, { align: 'right' });
  
  metaY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  pdf.text('Status', metaLabelX, metaY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94);
  pdf.text('PAID', metaValueX, metaY, { align: 'right' });
  
  // Billing Information Section
  yPos = 95;
  
  // Left Column - Bill To
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...grayText);
  pdf.text('BILL TO', margin, yPos);
  
  yPos += 7;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text(details.fullName, margin, yPos);
  
  yPos += 6;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  const collegeText = pdf.splitTextToSize(details.collegeName, 85);
  pdf.text(collegeText, margin, yPos);
  yPos += collegeText.length * 5;
  
  pdf.text(`${details.district}, ${details.state}`, margin, yPos);
  yPos += 5;
  pdf.text(details.email, margin, yPos);
  yPos += 5;
  pdf.text(details.mobileNumber, margin, yPos);
  
  // Right Column - Event Details
  const rightColX = 115;
  let eventY = 95;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...grayText);
  pdf.text('EVENT DETAILS', rightColX, eventY);
  
  eventY += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...darkText);
  
  const eventInfo = [
    ['Event', details.eventTitle],
    ['Date', details.eventDate],
    ['Venue', details.eventVenue],
    ['Registration ID', details.registrationId]
  ];
  
  eventInfo.forEach(([label, value]) => {
    pdf.setTextColor(...grayText);
    pdf.text(label, rightColX, eventY);
    pdf.setTextColor(...darkText);
    const valueText = pdf.splitTextToSize(value, 65);
    pdf.text(valueText, rightColX + 25, eventY);
    eventY += Math.max(5, valueText.length * 5);
  });
  
  // Payment Details Table
  yPos = 155;
  
  // Table Header
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...grayText);
  pdf.text('DESCRIPTION', margin, yPos);
  pdf.text('AMOUNT', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 3;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  // Table Content
  yPos += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...darkText);
  const descText = pdf.splitTextToSize(`Registration Fee - ${details.eventTitle}`, contentWidth - 40);
  pdf.text(descText, margin, yPos);
  pdf.text(`₹${details.paymentAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += Math.max(8, descText.length * 5);
  pdf.setDrawColor(...borderColor);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  // Subtotal
  yPos += 8;
  pdf.setFontSize(9);
  pdf.setTextColor(...grayText);
  pdf.text('Subtotal', margin, yPos);
  pdf.setTextColor(...darkText);
  pdf.text(`₹${details.paymentAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 6;
  pdf.setTextColor(...grayText);
  pdf.text('Tax (Inclusive)', margin, yPos);
  pdf.setTextColor(...darkText);
  pdf.text('₹0.00', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  pdf.setDrawColor(...borderColor);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  // Total
  yPos += 8;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkText);
  pdf.text('TOTAL', margin, yPos);
  pdf.text(`₹${details.paymentAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 3;
  pdf.setLineWidth(1);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  // Payment Information
  yPos += 15;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...grayText);
  pdf.text('PAYMENT INFORMATION', margin, yPos);
  
  yPos += 8;
  pdf.setFont('helvetica', 'normal');
  
  const paymentDetails = [
    ['Payment Method', details.paymentMethod],
    ['Transaction ID', details.transactionId || 'N/A'],
    ['Payment Date', details.paymentDate.toLocaleDateString('en-IN')],
    ['Verified Date', details.paymentVerifiedDate.toLocaleDateString('en-IN')]
  ];
  
  paymentDetails.forEach(([label, value]) => {
    pdf.setTextColor(...grayText);
    pdf.text(label, margin, yPos);
    pdf.setTextColor(...darkText);
    pdf.text(value, margin + 40, yPos);
    yPos += 5;
  });

  // Footer
  const footerY = 277;
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...grayText);
  pdf.text('Thank you for your participation in CodeBreakers 2025', pageWidth / 2, footerY + 5, { align: 'center' });
  pdf.setFontSize(7);
  pdf.text('This is a computer-generated invoice and does not require a signature', pageWidth / 2, footerY + 9, { align: 'center' });
  
  // Convert to buffer
  const pdfOutput = pdf.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export async function generateInvoiceHTML(details: InvoiceDetails): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin: 0;
        }
        .company-info {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 20px 0;
        }
        .invoice-meta {
          text-align: right;
          margin-bottom: 30px;
        }
        .bill-to {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .event-details {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #3b82f6;
        }
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .payment-table th {
          background-color: #3b82f6;
          color: white;
          padding: 12px;
          text-align: left;
        }
        .payment-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-section {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          text-align: right;
          margin-bottom: 30px;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
        }
        .payment-info {
          background-color: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 8px;
        }
        .label {
          font-weight: bold;
          width: 150px;
          color: #555;
        }
        .value {
          flex: 1;
        }
        .terms {
          background-color: #fffbeb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin-bottom: 30px;
        }
        .terms ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .terms li {
          margin-bottom: 8px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="company-name">CodeBreakers 2025</h1>
        <div class="company-info">Government College of Engineering Kalahandi</div>
        <div class="company-info">Bhawanipatna P.O, Kalahandi - 766002, Odisha, India</div>
        <div class="company-info">Email: CodeBreakers.gcekbhawanipatna@gmail.com</div>
      </div>
      
      <div class="invoice-meta">
        <div><strong>Invoice No:</strong> ${details.invoiceNumber}</div>
        <div><strong>Invoice Date:</strong> ${details.paymentVerifiedDate.toLocaleDateString('en-IN')}</div>
      </div>
      
      <h1 class="invoice-title">PAYMENT INVOICE</h1>
      
      <div class="bill-to">
        <h2 class="section-title">BILL TO</h2>
        <div><strong>${details.fullName}</strong></div>
        <div>${details.collegeName}</div>
        <div>${details.district}, ${details.state}</div>
        <div>Email: ${details.email}</div>
        <div>Mobile: ${details.mobileNumber}</div>
      </div>
      
      <div class="event-details">
        <h2 class="section-title">EVENT DETAILS</h2>
        <div class="detail-row">
          <span class="label">Event:</span>
          <span class="value">${details.eventTitle}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${details.eventDate}</span>
        </div>
        <div class="detail-row">
          <span class="label">Venue:</span>
          <span class="value">${details.eventVenue}</span>
        </div>
        <div class="detail-row">
          <span class="label">Registration ID:</span>
          <span class="value">${details.registrationId}</span>
        </div>
      </div>
      
      <h2 class="section-title">PAYMENT DETAILS</h2>
      <table class="payment-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Registration Fee - ${details.eventTitle}</td>
            <td style="text-align: right;">₹${details.paymentAmount}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-amount">TOTAL: ₹${details.paymentAmount}</div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">(Inclusive of all taxes)</div>
      </div>
      
      <div class="payment-info">
        <h2 class="section-title">PAYMENT INFORMATION</h2>
        <div class="detail-row">
          <span class="label">Payment Method:</span>
          <span class="value">${details.paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction ID:</span>
          <span class="value">${details.transactionId || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Date:</span>
          <span class="value">${details.paymentDate.toLocaleDateString('en-IN')}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Verified:</span>
          <span class="value">${details.paymentVerifiedDate.toLocaleDateString('en-IN')}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value" style="color: #059669; font-weight: bold;">PAID</span>
        </div>
      </div>
      
      <div class="terms">
        <h2 class="section-title">TERMS & CONDITIONS</h2>
        <ul>
          <li>This invoice serves as proof of payment for event registration</li>
          <li>Registration is non-transferable and non-refundable</li>
          <li>Participant must present valid ID during the event</li>
          <li>Event organizers reserve the right to make changes to the event schedule</li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for your participation in CodeBreakers 2025!</strong></p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </body>
    </html>
  `;
}