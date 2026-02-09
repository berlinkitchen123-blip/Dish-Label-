import { jsPDF } from "jspdf";
import type { LabelData } from "../types.js";

// Internal helper to create the PDF document
const createPDFDoc = (data: LabelData[]): jsPDF => {
  // A4 dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Layout Specification ---
  // Page Width: 210mm
  // Page Height: 297mm
  
  // Vertical Layout Calculation:
  // User Requirement: 15mm Top Margin, 15mm Bottom Margin.
  // Available Printable Height = 297 - 15 - 15 = 267mm.
  // Content Height = 7 rows * 38mm = 266mm.
  // Spare Space = 267 - 266 = 1mm.
  // StartY = 15.5mm.

  // Horizontal Layout Calculation:
  // User Requirement: 7mm Left Margin.
  // Content: 63 + 3 + 63 + 3 + 63 = 202mm.
  // StartX = 7mm.
  
  const columns = 3;
  const rows = 7;
  const itemsPerPage = columns * rows;
  
  const boxWidth = 63; 
  const boxHeight = 38; 
  const cornerRadius = 2; 
  
  const horizontalGap = 3;
  const verticalGap = 0; 
  
  const startX = 7;  
  const startY = 15.5; 

  data.forEach((item, index) => {
    // Check if we need a new page
    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage();
    }

    const positionOnPage = index % itemsPerPage;
    const colIndex = positionOnPage % columns;
    const rowIndex = Math.floor(positionOnPage / columns);

    const x = startX + (colIndex * (boxWidth + horizontalGap));
    const y = startY + (rowIndex * (boxHeight + verticalGap));

    // --- Draw Box ---
    doc.setDrawColor(200, 200, 200); // Light gray border
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius, "S");

    // --- 1. Header (Dish Letter) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(23, 64, 52); // Dark Green
    const headerText = (item.header || "").toUpperCase();
    doc.text(headerText, x + (boxWidth / 2), y + 7, { align: "center" });

    // --- 2. Content (Dish Name) ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10); // Slightly smaller to accommodate more fields
    doc.setTextColor(60, 60, 60); // Dark Gray
    
    // Handle text wrapping
    const contentLines = doc.splitTextToSize(item.content || "", boxWidth - 4);
    // Limit to 2 lines to ensure space for footer and sub-footer
    const maxLines = 2; 
    const displayLines = contentLines.length > maxLines ? contentLines.slice(0, maxLines) : contentLines;
    
    // Position: Middle section (shifted up slightly)
    doc.text(displayLines, x + (boxWidth / 2), y + 16, { align: "center" });

    // --- 3. Footer (User Name) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(230, 126, 140); // Pink
    const footerText = (item.footer || "").toUpperCase();
    doc.text(footerText, x + (boxWidth / 2), y + 29, { align: "center" });

    // --- 4. Sub-Footer (Company Name) ---
    doc.setFont("helvetica", "bold"); // or italic
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100); // Gray
    const subFooterText = (item.subFooter || "").toUpperCase();
    // Position: Very bottom of box
    doc.text(subFooterText, x + (boxWidth / 2), y + 36, { align: "center" });
  });

  return doc;
};

export const downloadPDF = (data: LabelData[]) => {
  const doc = createPDFDoc(data);
  doc.save("labels.pdf");
};

export const printPDF = (data: LabelData[]) => {
  const doc = createPDFDoc(data);
  doc.autoPrint(); 
  
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  
  window.open(url, '_blank');
};

export const generatePDF = downloadPDF;