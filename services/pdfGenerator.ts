import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

const BG = { r: 27, g: 94, b: 32 };

// Mirror LabelPreview.tsx — font scales DOWN as more fields are filled
// px → pt conversion: pt = px * 0.75
const getFs = (count: number): number => {
  if (count <= 1) return 21;  // 30px
  if (count === 2) return 15; // 22px
  if (count === 3) return 10.5;   // 16px
  return 8.25;                  // 13px (4+ fields)
};

// Circle radius in mm (px * 25.4/96 / 2 = radius)
const getCircleR = (count: number): number => {
  if (count <= 1) return 5.8;   // 44px circle
  if (count === 2) return 4.5;  // 34px
  if (count === 3) return 3.7;  // 28px
  return 2.9;                   // 22px
};

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const columns = 3, rowsPerPage = 7, itemsPerPage = columns * rowsPerPage;

  // Original layout values — do not change
  const boxW    = 63;
  const boxH    = 38;
  const gapX    = 3;
  const gapY    = 0;
  const startX  = 7;
  const startY  = 15.5;
  const cornerR = 2;

  const footerH = 9; // logo image with padding

  const eLogo = logoUrl ?? DEFAULT_LOGO_URL;
  let lFmt: string | null = null, lData: string | null = null;
  if (eLogo.startsWith("data:image/png"))  { lFmt="PNG";  lData=eLogo; }
  if (eLogo.startsWith("data:image/jpeg")||eLogo.startsWith("data:image/jpg")) { lFmt="JPEG"; lData=eLogo; }

  const expanded: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) expanded.push(item);
  });

  expanded.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) doc.addPage();

    const pos = index % itemsPerPage;
    const x   = startX + (pos % columns)           * (boxW + gapX);
    const y   = startY + Math.floor(pos / columns)  * (boxH + gapY);
    const cx  = x + boxW / 2;

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxW, boxH, cornerR, cornerR);
    const customer = (item.customerName||"").trim().toUpperCase();
    const dishName = (item.dishName    ||"").trim();
    const letter   = (item.dishLetter  ||"").toUpperCase().trim();
    const dtype    = (item.dishType    ||"").trim().toUpperCase();
    const allerg   = (item.allergens   ||"").trim().toUpperCase();

    // Count of filled main fields (same logic as LabelPreview)
    const count = [customer, dishName, letter].filter(Boolean).length;
    const MAIN_PT  = getFs(count);
    const circleR  = getCircleR(count);
    const lineH_mm = MAIN_PT * 0.352778 * 1.25;  // pt→mm × line-height factor
    const gap      = count <= 1 ? 2.5 : count === 2 ? 1.5 : 1;

    // ── Footer: separator + logo image + optional sub ────────────────────────
    const sepY = y + boxH - footerH;
    doc.setDrawColor(BG.r, BG.g, BG.b);
    doc.setLineWidth(0.3);
    doc.line(x+4, sepY, x+boxW-4, sepY);

    // Logo image in footer (just the logo, allergens moved to content zone)
    const logoY = sepY + 1.5;

    // Logo image in footer (PNG/JPEG); fallback to styled text for SVG/default
    if (lData && lFmt) {
      try {
        const logoH = 7, logoW = logoH * (520/90);
        doc.addImage(lData, lFmt, cx - logoW/2, logoY, logoW, logoH);
      } catch(_) {
        // image failed — draw text fallback
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(240, 110, 181); // brand pink
        doc.text("BELLABONA", cx, logoY + 4, { align: "center", charSpace: 1 });
      }
    } else {
      // No PNG/JPEG logo (e.g. default SVG) — draw text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(240, 110, 181); // brand pink
      doc.text("BELLABONA", cx, logoY + 4, { align: "center", charSpace: 1 });
    }

    // ── Main content: centred in zone between top of box and separator ────────
    const contentTop = y + 2;
    const contentBot = sepY - 1;
    const contentMid = (contentTop + contentBot) / 2;

    // Pre-calculate total height of all content blocks
    let totalH = 0;
    let nameLines: string[] = [];

    if (customer) totalH += lineH_mm;
    if (customer && (dishName||letter)) totalH += gap;
    if (dishName) {
      doc.setFontSize(MAIN_PT);
      nameLines = doc.splitTextToSize(dishName, boxW - 4);
      if (nameLines.length > 2) nameLines = nameLines.slice(0, 2);
      totalH += nameLines.length * lineH_mm;
    }
    if (dishName && letter) totalH += gap;
    if (letter) {
      totalH += (letter.length > 2 ? 8 : circleR * 2);
    }
    if (allerg) totalH += gap + 3.5;

    // Start drawing from vertical centre
    let dy = contentMid - totalH / 2;

    // Customer name
    if (customer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(MAIN_PT);
      doc.setTextColor(0, 0, 0);
      // Truncate if too wide
      let cust = customer;
      while (cust.length > 1 && doc.getTextWidth(cust) > boxW - 4) cust = cust.slice(0,-1);
      if (cust !== customer) cust += "…";
      doc.text(cust, cx, dy + lineH_mm * 0.8, { align: "center" });
      dy += lineH_mm;
      if (dishName||letter) dy += gap;
    }

    // Dish name
    if (dishName) {
      doc.setFont("helvetica", customer ? "normal" : "bold");
      doc.setFontSize(MAIN_PT);
      doc.setTextColor(240, 110, 181);
      doc.setLineHeightFactor(1.25);
      doc.text(nameLines, cx, dy + lineH_mm * 0.8, { align: "center" });
      doc.setLineHeightFactor(1.15);
      dy += nameLines.length * lineH_mm;
      if (letter) dy += gap;
    }

    // Dish letter: circle or rounded box
    if (letter) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      if (letter.length > 2) {
        const fpt = Math.max(MAIN_PT - 1.5, 8);
        doc.setFontSize(fpt);
        const tw = doc.getTextWidth(letter);
        const bw = Math.max(tw+6, 12), bh = 8;
        doc.roundedRect(cx-bw/2, dy, bw, bh, 1.5, 1.5);
        doc.text(letter, cx, dy+bh/2, { align:"center", baseline:"middle" });
      } else {
        doc.circle(cx, dy + circleR, circleR);
        doc.setFontSize(circleR * 3.5);  // ~55% of diameter in pt
        doc.text(letter, cx, dy + circleR, { align:"center", baseline:"middle" });
      }
    }

    // Allergens — in content zone, after main fields
    if (allerg) {
      dy += gap;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      let t = allerg;
      while (t.length > 1 && doc.getTextWidth(t) > boxW - 4) t = t.slice(0, -1);
      if (t !== allerg) t += "…";
      doc.text(t, cx, dy + 2.5, { align: "center" });
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
