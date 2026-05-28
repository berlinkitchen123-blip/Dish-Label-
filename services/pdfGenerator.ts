import { jsPDF } from "jspdf";
import { LabelData } from "../types";

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

  // Expand data based on quantity
  const expandedData: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity > 0 ? item.quantity : 1;
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
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius);

    const centerX = x + (boxWidth / 2);

    // ==========================================
    // 1. Customer Name (Top Center, First Letter Double Size)
    // ==========================================
    const customerName = (item.customerName || "").trim().toUpperCase();
    
    if (customerName) {
        const firstChar = customerName.charAt(0);
        const rest = customerName.slice(1);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Black for thermal printing

        doc.setFontSize(24);
        const w1 = doc.getTextWidth(firstChar);
        doc.setFontSize(12);
        const w2 = doc.getTextWidth(rest);

        // Reduce the effective width of the first character to tighten the gap
        // Large font sizes often have extra padding in their bounding boxes
        const adjustedW1 = w1 * 0.75; 
        const totalWidth = adjustedW1 + w2;
        const textStartX = centerX - (totalWidth / 2);

        // Draw First Char
        doc.setFontSize(24);
        doc.text(firstChar, textStartX, y + 8);

        // Draw Rest
        doc.setFontSize(12);
        doc.text(rest, textStartX + adjustedW1, y + 8);
    } else {
        // Fallback for empty name
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); 
        doc.setFontSize(14);
        doc.text("CUSTOMER", centerX, y + 8, { align: "center" });
    }

    // ==========================================
    // 2. Dish Name (Below Name)
    // ==========================================
    const dishName = item.dishName || "";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    
    const contentLines = doc.splitTextToSize(dishName, boxWidth - 6);
    const maxLines = 2;
    const displayLines = contentLines.length > maxLines ? contentLines.slice(0, maxLines) : contentLines;
    
    // Increase line height for better spacing
    doc.setLineHeightFactor(1.35);
    doc.text(displayLines, centerX, y + 13, { align: "center" });
    doc.setLineHeightFactor(1.15); // Reset to default

    // ==========================================
    // 3. Dish Letter (Circle or Box for Addons)
    // ==========================================
    const dishLetter = (item.dishLetter || "A").toUpperCase();
    const isLongText = dishLetter.length > 2;

    doc.setDrawColor(0, 0, 0); // Black Border
    doc.setLineWidth(0.4);

    if (isLongText) {
       // Draw Box (Rounded Rectangle to cover "ADDONS")
       doc.setFontSize(10);
       const textWidth = doc.getTextWidth(dishLetter);
       const padding = 3;
       const boxW = Math.max(textWidth + (padding * 2), 12);
       const boxH = 8;
       const rectX = centerX - (boxW / 2);
       const rectY = y + 19; // Moved up slightly

       doc.roundedRect(rectX, rectY, boxW, boxH, 1, 1);
       
       // Center text in box
       doc.setFont("helvetica", "bold");
       doc.setTextColor(0, 0, 0);
       doc.text(dishLetter, centerX, rectY + 5.5, { align: "center" });
    } else {
       // Draw Circle (Original Logic)
       const circleY = y + 23; // Moved up slightly
       const circleRadius = 4;
       doc.circle(centerX, circleY, circleRadius);

       doc.setFont("helvetica", "bold");
       doc.setFontSize(13);
       doc.setTextColor(0, 0, 0);
       doc.text(dishLetter, centerX, circleY + 1.5, { align: "center", baseline: "bottom" });
    }

    // ==========================================
    // Bottom-Up Stacking for Footer Elements
    // ==========================================
    let currentBottomY = y + 35;

    // 5. Restaurant (Footer)
    const brandText = (item.brand || "RESTAURANT").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(brandText, centerX, currentBottomY, { align: "center" });
    currentBottomY -= 3.5;

    // 4. Allergens (Small, Bottom)
    const allergens = (item.allergens || "").toUpperCase();
    if (allergens) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7); // Increased size for readability
      doc.setTextColor(0, 0, 0); // Black for thermal printers
      
      // Truncate if too long
      let displayAllergens = allergens;
      if (doc.getTextWidth(displayAllergens) > boxWidth - 4) {
          while (displayAllergens.length > 0 && doc.getTextWidth(displayAllergens + "...") > boxWidth - 4) {
              displayAllergens = displayAllergens.slice(0, -1);
          }
          displayAllergens += "...";
      }
      
      doc.text(displayAllergens, centerX, currentBottomY, { align: "center" });
      currentBottomY -= 3.5;
    }

    // 3.5 Dish Type (Vegan, Vegetarian, Meat)
    const dishType = (item.dishType || "").toUpperCase();
    if (dishType) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0); // Black
      doc.text(dishType, centerX, currentBottomY, { align: "center" });
    }

  });

  return doc;
};

export const downloadPDF = (data: LabelData[]) => {
  const doc = createPDFDoc(data);
  doc.save("labels.pdf");
};

export const printPDF = (data: LabelData[]) => {
  const doc = createPDFDoc(data);
  doc.autoPrint(); // Injects print script into PDF
  
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  
  // Open in new tab - this is the most reliable way to print
  const printWindow = window.open(url, '_blank');
  
  if (!printWindow) {
    alert("Please allow popups to open the print dialog.");
  }
};

export const generatePDF = downloadPDF;