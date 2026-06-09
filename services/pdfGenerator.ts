import { jsPDF } from "jspdf";
import { LabelData } from "../types";

// Internal helper to create the PDF document
const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
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

  // Determine logo format for jsPDF (only PNG/JPEG supported natively)
  let logoFormat: string | null = null;
  let logoData: string | null = null;
  if (logoUrl) {
    if (logoUrl.startsWith('data:image/png')) {
      logoFormat = 'PNG';
      logoData = logoUrl;
    } else if (logoUrl.startsWith('data:image/jpeg') || logoUrl.startsWith('data:image/jpg')) {
      logoFormat = 'JPEG';
      logoData = logoUrl;
    }
    // SVG not supported by jsPDF addImage — falls back to text only
  }

  // Expand data based on quantity
  // BUG 2 FIX: use ?? 1 so an explicit qty=0 produces 0 copies in the PDF
  const expandedData: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) {
      expandedData.push(item);
    }
  });

  expandedData.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage();
    }

    const positionOnPage = index % itemsPerPage;
    const colIndex = positionOnPage % columns;
    const rowIndex = Math.floor(positionOnPage / columns);

    const x = startX + (colIndex * (boxWidth + horizontalGap));
    const y = startY + (rowIndex * (boxHeight + verticalGap));

    // Draw Box Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius);

    const centerX = x + (boxWidth / 2);

    // 1. Customer Name
    const customerName = (item.customerName || "").trim().toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(customerName || "CUSTOMER", centerX, y + 8, { align: "center" });

    // 2. Dish Name
    const dishName = item.dishName || "";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const contentLines = doc.splitTextToSize(dishName, boxWidth - 6);
    const maxLines = 2;
    const displayLines = contentLines.length > maxLines ? contentLines.slice(0, maxLines) : contentLines;
    doc.setLineHeightFactor(1.35);
    doc.text(displayLines, centerX, y + 13, { align: "center" });
    doc.setLineHeightFactor(1.15);

    // 3. Dish Letter (circle or box)
    const dishLetter = (item.dishLetter || "A").toUpperCase();
    const isLongText = dishLetter.length > 2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);

    if (isLongText) {
      doc.setFontSize(10);
      const textWidth = doc.getTextWidth(dishLetter);
      const padding = 3;
      const boxW = Math.max(textWidth + (padding * 2), 12);
      const boxH = 8;
      const rectX = centerX - (boxW / 2);
      const rectY = y + 19;
      doc.roundedRect(rectX, rectY, boxW, boxH, 1, 1);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(dishLetter, centerX, rectY + 5.5, { align: "center" });
    } else {
      const circleY = y + 23;
      const circleRadius = 4;
      doc.circle(centerX, circleY, circleRadius);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      // BUG 5 FIX: baseline "middle" so the letter is vertically centred in the circle
      doc.text(dishLetter, centerX, circleY, { align: "center", baseline: "middle" });
    }

    // Bottom-up stacking for footer
    let currentBottomY = y + 35;

    // 5. Brand logo (if PNG/JPEG provided) or brand text
    if (logoData && logoFormat) {
      // Draw logo image: max 20mm wide, 5mm tall, centred
      const logoMaxW = 20;
      const logoMaxH = 5;
      try {
        doc.addImage(logoData, logoFormat, centerX - logoMaxW / 2, currentBottomY - logoMaxH, logoMaxW, logoMaxH);
      } catch (_) {
        // Fallback to text if image fails
        const brandText = (item.brand || "RESTAURANT").toUpperCase();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(brandText, centerX, currentBottomY, { align: "center" });
      }
      currentBottomY -= (logoMaxH + 1);
    } else {
      const brandText = (item.brand || "RESTAURANT").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(brandText, centerX, currentBottomY, { align: "center" });
      currentBottomY -= 3.5;
    }

    // 4. Allergens
    const allergens = (item.allergens || "").toUpperCase();
    if (allergens) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
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

    // 3.5 Dish Type
    const dishType = (item.dishType || "").toUpperCase();
    if (dishType) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(dishType, centerX, currentBottomY, { align: "center" });
    }
  });

  return doc;
};

export const downloadPDF = (data: LabelData[], logoUrl?: string) => {
  const doc = createPDFDoc(data, logoUrl);
  doc.save("labels.pdf");
};

export const printPDF = (data: LabelData[], logoUrl?: string) => {
  const doc = createPDFDoc(data, logoUrl);
  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    alert("Please allow popups to open the print dialog.");
  }
};

export const generatePDF = downloadPDF;
