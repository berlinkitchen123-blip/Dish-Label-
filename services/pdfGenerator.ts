import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

const BG = { r: 27, g: 94, b: 32 };

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const columns = 3, rowsPerPage = 7, itemsPerPage = columns * rowsPerPage;
  const pageW = 210, pageH = 297;
  const marginX = 8, marginY = 10, gapX = 3, gapY = 2;

  const boxW = (pageW - 2*marginX - (columns-1)*gapX) / columns;
  const boxH = (pageH - 2*marginY - (rowsPerPage-1)*gapY) / rowsPerPage;
  const cornerR = 2;

  // 20px BELLABONA ≈ 15pt ≈ 5.3mm line height → footerH needs ~9mm
  const footerH = 9.5;

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
    const x   = marginX + (pos % columns)           * (boxW + gapX);
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
      } catch(_) {}
    }

    const customer = (item.customerName||"").trim().toUpperCase();
    const dishName = (item.dishName    ||"").trim();
    const letter   = (item.dishLetter  ||"").toUpperCase().trim();
    const dtype    = (item.dishType    ||"").trim().toUpperCase();
    const allerg   = (item.allergens   ||"").trim().toUpperCase();
    const brand    = (item.brand       ||"BELLABONA").toUpperCase();

    // ── Footer: separator + BELLABONA 15pt + optional sub ────────────────────
    const sepY = y + boxH - footerH;
    doc.setDrawColor(BG.r, BG.g, BG.b);
    doc.setLineWidth(0.3);
    doc.line(x+4, sepY, x+boxW-4, sepY);

    // BELLABONA at 15pt in brand green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(BG.r, BG.g, BG.b);
    doc.text(brand, cx, y+boxH-1.8, { align: "center" });

    // Dish type · allergens at 7pt above BELLABONA
    if (dtype || allerg) {
      const sub = [dtype, allerg].filter(Boolean).join(" · ");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      let t = sub;
      while (t.length > 1 && doc.getTextWidth(t) > boxW-4) t = t.slice(0,-1);
      if (t !== sub) t += "…";
      doc.text(t, cx, sepY + 2.5, { align: "center" });
    }

    // ── Main content at 22.5pt (≈30px), centred between top and separator ────
    const MAIN_PT  = 22.5;   // 30px → pt
    const lineH_mm = MAIN_PT * 0.352778 * 1.25;  // pt→mm × line-height factor

    const contentTop = y + 2;
    const contentBot = sepY - 1;
    const contentMid = (contentTop + contentBot) / 2;

    let totalH = 0;
    let nameLines: string[] = [];
    const gap = 2;

    if (customer) totalH += lineH_mm;
    if (customer && (dishName||letter)) totalH += gap;
    if (dishName) {
      doc.setFontSize(MAIN_PT);
      nameLines = doc.splitTextToSize(dishName, boxW - 4);
      if (nameLines.length > 2) nameLines = nameLines.slice(0, 2);
      totalH += nameLines.length * lineH_mm;
    }
    if (dishName && letter) totalH += gap;
    if (letter) totalH += (letter.length > 2 ? 8 : 11);  // box=8mm, circle=11mm

    let dy = contentMid - totalH / 2;

    // Customer name
    if (customer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(MAIN_PT);
      doc.setTextColor(0, 0, 0);
      doc.text(customer, cx, dy + lineH_mm * 0.8, { align: "center" });
      dy += lineH_mm;
      if (dishName||letter) dy += gap;
    }

    // Dish name
    if (dishName) {
      doc.setFont("helvetica", customer ? "normal" : "bold");
      doc.setFontSize(MAIN_PT);
      doc.setTextColor(20, 20, 20);
      doc.setLineHeightFactor(1.25);
      doc.text(nameLines, cx, dy + lineH_mm * 0.8, { align: "center" });
      doc.setLineHeightFactor(1.15);
      dy += nameLines.length * lineH_mm;
      if (letter) dy += gap;
    }

    // Dish letter
    if (letter) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      if (letter.length > 2) {
        doc.setFontSize(18);
        const tw = doc.getTextWidth(letter);
        const bw = Math.max(tw+8, 14), bh = 8;
        doc.roundedRect(cx-bw/2, dy, bw, bh, 1.5, 1.5);
        doc.text(letter, cx, dy+bh/2, { align:"center", baseline:"middle" });
      } else {
        const r = 5.5;
        doc.circle(cx, dy+r, r);
        doc.setFontSize(20);
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
