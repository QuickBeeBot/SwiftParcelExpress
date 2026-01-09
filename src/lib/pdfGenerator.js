
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoice, shipment, customer) => {
  const doc = new jsPDF();
  
  // Theme Color
  const primaryColor = [54, 255, 219]; // #36FFDB in RGB (approx for bright cyan)
  const darkColor = [31, 31, 31];

  // Header
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SwiftParcel', 15, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Global Logistics & Shipping', 15, 32);
  doc.text('swiftparcel.global', 160, 25, { align: 'right' });

  // Invoice Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text(invoice.status === 'Paid' ? 'RECEIPT' : 'INVOICE', 15, 60);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Right Side Info
  const rightColX = 140;
  let currentY = 60;
  
  doc.text(`Invoice #: ${invoice.invoice_number}`, rightColX, currentY);
  currentY += 6;
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, rightColX, currentY);
  currentY += 6;
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, rightColX, currentY);
  currentY += 6;
  doc.text(`Status: ${invoice.status}`, rightColX, currentY);

  // Bill To
  doc.text('Bill To:', 15, 80);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(customer?.name || shipment?.customer_name || 'Valued Customer', 15, 86);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(customer?.email || shipment?.email || '', 15, 92);
  doc.text(customer?.address || shipment?.address || '', 15, 98);
  doc.text(customer?.country || shipment?.country || '', 15, 104);

  // Table
  const tableData = [
    ['Description', 'Tracking ID', 'Amount'],
    [`Shipping Services - ${shipment?.package_info || 'Standard Cargo'}`, shipment?.tracking_id, `$${invoice.amount.toFixed(2)}`]
  ];

  doc.autoTable({
    startY: 120,
    head: [tableData[0]],
    body: [tableData[1]],
    theme: 'grid',
    headStyles: { fillColor: darkColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Total
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Amount:', 140, finalY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${invoice.amount.toFixed(2)} USD`, 170, finalY, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing SwiftParcel.', 105, 270, { align: 'center' });
  doc.text('© SwiftParcel. All rights reserved. swiftparcel.global', 105, 275, { align: 'center' });

  doc.save(`${invoice.invoice_number}.pdf`);
};
