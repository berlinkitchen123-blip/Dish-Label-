import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

// Internal helper to create the PDF document
const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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

  // Resolve the logo: caller-supplied > default
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;

  // Determine format for jsPDF (PNG/JPEG only; SVG used as watermark fallback via canvas won't work — skip)
  let logoFormat: string | null = null;
  let logoData: string | null = null;
  if (effectiveLogo) {
    if (effectiveLogo.startsWith('data:image/png')) {
      logoFormat = 'PNG'; logoData = effectiveLogo;
    } else if (effectiveLogo.startsWith('data:image/jpeg') || effectiveLogo.startsWith('data:image/jpg')) {
      logoFormat = 'JPEG'; logoData = effectiveLogo;
    }
    // SVG data URLs: skip addImage (not supported); watermark shows only in HTML preview
  }

  // Expand data based on quantity (qty=0 → 0 copies; null/undefined → 1 copy)
  const expandedData: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) expandedData.push(item);
  });

  expandedData.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) doc.addPage();

    const positionOnPage = index % itemsPerPage;
    const colIndex = positionOnPage % columns;
    const rowIndex = Math.floor(positionOnPage / columns);

    const x = startX + colIndex * (boxWidth + horizontalGap);
    const y = startY + rowIndex * (boxHeight + verticalGap);
    const centerX = x + boxWidth / 2;

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius);

    // ── Watermark logo (PNG/JPEG only, low opacity) ──────────────────────────
    if (logoData && logoFormat) {
      try {
        doc.saveGraphicsState();
        // jsPDF 2.x GState for opacity
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
        const wmW = 50;
        const wmH = 9;
        doc.addImage(logoData, logoFormat, centerX - wmW / 2, y + (boxHeight - wmH) / 2, wmW, wmH);
        doc.restoreGraphicsState();
      } catch (_) { /* GState not supported — skip watermark silently */ }
    }

    // ── 1. Customer Name (omit if empty) ─────────────────────────────────────
    const customerName = (item.customerName || "").trim().toUpperCase();
    if (customerName) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(customerName, centerX, y + 8, { align: "center" });
    }

    // ── 2. Dish Name ─────────────────────────────────────────────────────────
    const dishName = item.dishName || "";
    if (dishName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const contentLines = doc.splitTextToSize(dishName, boxWidth - 6);
      const displayLines = contentLines.length > 2 ? contentLines.slice(0, 2) : contentLines;
      doc.setLineHeightFactor(1.35);
      doc.text(displayLines, centerX, y + 13, { align: "center" });
      doc.setLineHeightFactor(1.15);
    }

    // ── 3. Dish Letter circle / box (omit if empty) ──────────────────────────
    const dishLetter = (item.dishLetter || "").toUpperCase().trim();
    if (dishLetter) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      const isLong = dishLetter.length > 2;
      if (isLong) {
        doc.setFontSize(10);
        const textWidth = doc.getTextWidth(dishLetter);
        const padding = 3;
        const boxW = Math.max(textWidth + padding * 2, 12);
        const boxH = 8;
        const rectX = centerX - boxW / 2;
        const rectY = y + 19;
        doc.roundedRect(rectX, rectY, boxW, boxH, 1, 1);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(dishLetter, centerX, rectY + 5.5, { align: "center" });
      } else {
        const circleY = y + 23;
        doc.circle(centerX, circleY, 4);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(dishLetter, centerX, circleY, { align: "center", baseline: "middle" });
      }
    }

    // ── Bottom-up footer ─────────────────────────────────────────────────────
    let bottomY = y + 35;

    // Brand text
    const brandText = (item.brand || "BELLABONA").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(brandText, centerX, bottomY, { align: "center" });
    bottomY -= 3.5;

    // Allergens
    const allergens = (item.allergens || "").toUpperCase();
    if (allergens) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      let display = allergens;
      if (doc.getTextWidth(display) > boxWidth - 4) {
        while (display.length > 0 && doc.getTextWidth(display + "...") > boxWidth - 4)
          display = display.slice(0, -1);
        display += "...";
      }
      doc.text(display, centerX, bottomY, { align: "center" });
      bottomY -= 3.5;
    }

    // Dish Type
    const dishType = (item.dishType || "").toUpperCase();
    if (dishType) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(dishType, centerX, bottomY, { align: "center" });
    }
  });

  return doc;
};

export const downloadPDF = (data: LabelData[], logoUrl?: string) => {
  createPDFDoc(data, logoUrl).save("labels.pdf");
};

export const printPDF = (data: LabelData[], logoUrl?: string) => {
  const doc = createPDFDoc(data, logoUrl);
  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) alert("Please allow popups to open the print dialog.");
};

export const generatePDF = downloadPDF;
