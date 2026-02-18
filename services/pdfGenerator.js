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

  // Expand data based on quantity (if data structure assumes flat list but caller passes raw items with qty)
  const expandedData: LabelData[] = [];
  data.forEach(item => {
    // If item has a quantity property, respect it, otherwise 1
    const qty = (item as any).quantity > 0 ? (item as any).quantity : 1;
    for (let i = 0; i < qty; i++) {
      expandedData.push(item);
    }
  });

  expandedData.forEach((item, index) => {
    // Check if we need a new page
    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage();
    }

    const positionOnPage = index % itemsPerPage;
    const colIndex = positionOnPage % columns;
    const rowIndex = Math.floor(positionOnPage / columns);

    const x = startX + (colIndex * (boxWidth + horizontalGap));
    const y = startY + (rowIndex * (boxHeight + verticalGap));

    // --- Draw Box Border ---
    doc.setDrawColor(200, 200, 200); 
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius, "S");

    const centerX = x + (boxWidth / 2);

    // ==========================================
    // 1. Customer Name (Top Center, First Letter Double Size)
    // ==========================================
    // Map 'footer' to customerName based on previous JS logic or use direct property if updated
    const customerName = ((item as any).customerName || item.footer || "").toUpperCase();
    
    if (customerName) {
        const firstChar = customerName.charAt(0);
        const rest = customerName.slice(1);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(23, 64, 52); // Brand Green

        // Calculate total width to center the combined text
        doc.setFontSize(24); // Double size
        const w1 = doc.getTextWidth(firstChar);

        doc.setFontSize(12); // Regular size
        const w2 = doc.getTextWidth(rest);

        const totalWidth = w1 + w2;
        const textStartX = centerX - (totalWidth / 2);

        // Draw First Char
        doc.setFontSize(24);
        doc.text(firstChar, textStartX, y + 9);

        // Draw Rest
        doc.setFontSize(12);
        doc.text(rest, textStartX + w1, y + 9);
    } else {
        // Fallback for empty name
        doc.setFont("helvetica", "bold");
        doc.setTextColor(23, 64, 52); 
        doc.setFontSize(14);
        doc.text("CUSTOMER", centerX, y + 9, { align: "center" });
    }

    // ==========================================
    // 2. Dish Name (Below Name)
    // ==========================================
    const dishName = (item as any).dishName || item.content || "";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    
    const contentLines = doc.splitTextToSize(dishName, boxWidth - 6);
    const maxLines = 2;
    const displayLines = contentLines.length > maxLines ? contentLines.slice(0, maxLines) : contentLines;
    
    doc.text(displayLines, centerX, y + 14, { align: "center" });

    // ==========================================
    // 3. Dish Letter (Round Circle)
    // ==========================================
    const dishLetter = ((item as any).dishLetter || item.header || "A").toUpperCase();
    
    const circleY = y + 24;
    const circleRadius = 4;
    
    // Draw Circle
    doc.setDrawColor(23, 64, 52); // Brand Green Border
    doc.setLineWidth(0.4);
    doc.circle(centerX, circleY, circleRadius, "S"); // S = Stroke

    // Draw Letter
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(23, 64, 52);
    // Offset Y slightly for vertical centering in PDF
    doc.text(dishLetter, centerX, circleY + 1.5, { align: "center", baseline: "bottom" });

    // ==========================================
    // 4. Allergens (Small, Bottom)
    // ==========================================
    const allergens = ((item as any).allergens || "").toUpperCase();
    if (allergens) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(230, 126, 140); // Pink
      doc.text(allergens, centerX, y + 32, { align: "center" });
    }

    // ==========================================
    // 5. Restaurant (Footer)
    // ==========================================
    const brandText = ((item as any).brand || item.subFooter || "RESTAURANT").toUpperCase();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100); // Gray
    doc.text(brandText, centerX, y + 36, { align: "center" });

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
  
  // Use invisible iframe for direct print
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.src = url;
  
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    setTimeout(() => {
        try {
            iframe.contentWindow?.print();
        } catch (e) {
            console.error("Print failed", e);
        }
    }, 500);
  };
};

export const generatePDF = downloadPDF;