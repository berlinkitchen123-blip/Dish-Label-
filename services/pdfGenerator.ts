import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

// Bellabona brand green in RGB
const BG = { r: 27, g: 94, b: 32 };

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const columns = 3, rowsPerPage = 7, itemsPerPage = columns * rowsPerPage;
  const pageW = 210, pageH = 297;
  const marginX = 8,  marginY = 10;
  const gapX    = 3,  gapY   = 2;

  const boxW = (pageW - 2*marginX - (columns-1)*gapX) / columns;
  const boxH = (pageH - 2*marginY - (rowsPerPage-1)*gapY) / rowsPerPage;
  const cornerR = 2;

  // Footer zone (mm): separator + brand text
  const footerH   = 6.5;   // total footer height inside box
  const sepY_from_bottom = footerH;

  // Resolve logo (PNG/JPEG only for jsPDF)
  const eLogo = logoUrl ?? DEFAULT_LOGO_URL;
  let lFmt: string | null = null, lData: string | null = null;
  if (eLogo.startsWith("data:image/png"))                                  { lFmt="PNG";  lData=eLogo; }
  if (eLogo.startsWith("data:image/jpeg")||eLogo.startsWith("data:image/jpg")) { lFmt="JPEG"; lData=eLogo; }

  const expanded: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) expanded.push(item);
  });

  expanded.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) doc.addPage();

    const pos = index % itemsPerPage;
    const x   = marginX + (pos % columns)            * (boxW + gapX);
    const y   = marginY + Math.floor(pos / columns)  * (boxH + gapY);
    const cx  = x + boxW / 2;

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxW, boxH, cornerR, cornerR);

    // Watermark
    if (lData && lFmt) {
      try {
        doc.saveGraphicsState();
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.10 }));
        const ww = 44, wh = 7;
        doc.addImage(lData, lFmt, cx-ww/2, y+(boxH-wh)/2, ww, wh);
        doc.restoreGraphicsState();
      } catch (_) {}
    }

    // Field values
    const customer = (item.customerName||"").trim().toUpperCase();
    const dishName = (item.dishName    ||"").trim();
    const letter   = (item.dishLetter  ||"").toUpperCase().trim();
    const dtype    = (item.dishType    ||"").trim().toUpperCase();
    const allerg   = (item.allergens   ||"").trim().toUpperCase();
    const brand    = (item.brand       ||"BELLABONA").toUpperCase();

    // ── Footer: separator line + brand text, pinned at bottom ────────────────
    const sepY  = y + boxH - sepY_from_bottom;

    // Separator line in brand green
    doc.setDrawColor(BG.r, BG.g, BG.b);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([0], 0);
    doc.line(x + 4, sepY, x + boxW - 4, sepY);

    // Dish type + allergens on one line (gray)
    let brandLineY = y + boxH - 1.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(BG.r, BG.g, BG.b);
    doc.text(brand, cx, brandLineY, { align: "center" });

    if (dtype || allerg) {
      const sub = [dtype, allerg].filter(Boolean).join(" · ");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(80, 80, 80);
      doc.text(sub, cx, brandLineY - 3.2, { align: "center" });
    }

    // ── Main content: centred in zone from top-padding to above footer ────────
    const contentTop = y + 2;
    const contentBot = y + boxH - sepY_from_bottom - 1;
    const contentMid = (contentTop + contentBot) / 2;

    // Measure total height of content
    let totalH = 0, nameLines: string[] = [];
    const gap = 1.5;
    if (customer)  totalH += 5;
    if (customer && (dishName||letter)) totalH += gap;
    if (dishName) {
      doc.setFontSize(9);
      nameLines = doc.splitTextToSize(dishName, boxW - 5);
      if (nameLines.length > 2) nameLines = nameLines.slice(0, 2);
      totalH += nameLines.length * 4.2;
    }
    if (dishName && letter) totalH += gap;
    if (letter) totalH += (letter.length > 2 ? 7 : 9);

    let dy = contentMid - totalH / 2;

    // Customer name
    if (customer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(customer, cx, dy + 4, { align: "center" });
      dy += 5;
      if (dishName || letter) dy += gap;
    }

    // Dish name
    if (dishName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.setLineHeightFactor(1.3);
      doc.text(nameLines, cx, dy + 3, { align: "center" });
      doc.setLineHeightFactor(1.15);
      dy += nameLines.length * 4.2;
      if (letter) dy += gap;
    }

    // Dish letter
    if (letter) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.35);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      if (letter.length > 2) {
        doc.setFontSize(8);
        const tw = doc.getTextWidth(letter);
        const bw = Math.max(tw + 6, 12), bh = 6;
        doc.roundedRect(cx-bw/2, dy, bw, bh, 1, 1);
        doc.text(letter, cx, dy+bh/2, { align:"center", baseline:"middle" });
      } else {
        const r = 4;
        doc.circle(cx, dy+r, r);
        doc.setFontSize(10);
        doc.text(letter, cx, dy+r, { align:"center", baseline:"middle" });
      }
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
  const url = URL.createObjectURL(doc.output("blob"));
  const w = window.open(url, "_blank");
  if (!w) alert("Please allow popups to open the print dialog.");
};

export const generatePDF = downloadPDF;
