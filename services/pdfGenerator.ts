import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

const BG = { r: 27, g: 94, b: 32 };

// Scale font sizes based on how many content fields are present
const getFs = (count: number) => {
  if (count === 1) return 11;   // single field — large
  if (count === 2) return 9.5;
  if (count === 3) return 8.5;
  return 7.5;                   // 4+ — compact
};

const getCircleR = (count: number) => {
  if (count <= 1) return 6;
  if (count === 2) return 5;
  return 4;
};

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const columns = 3, rowsPerPage = 7, itemsPerPage = columns * rowsPerPage;
  const pageW = 210, pageH = 297;
  const marginX = 8, marginY = 10, gapX = 3, gapY = 2;

  const boxW = (pageW - 2*marginX - (columns-1)*gapX) / columns;
  const boxH = (pageH - 2*marginY - (rowsPerPage-1)*gapY) / rowsPerPage;
  const cornerR = 2;
  const footerH = 6.5;   // mm reserved for separator + BELLABONA + optional sub-line

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

    // Box
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

    // Count content items to determine font sizes
    const count = [customer, dishName, letter].filter(Boolean).length;
    const fs    = getFs(count);
    const cr    = getCircleR(count);

    // ── Footer (pinned bottom) ─────────────────────────────────────────────
    const sepY = y + boxH - footerH;

    // Separator line
    doc.setDrawColor(BG.r, BG.g, BG.b);
    doc.setLineWidth(0.25);
    doc.line(x+4, sepY, x+boxW-4, sepY);

    // BELLABONA in brand green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(BG.r, BG.g, BG.b);
    doc.text(brand, cx, y+boxH-1.5, { align: "center" });

    // Dish type · allergens (small grey, above BELLABONA)
    if (dtype || allerg) {
      const sub = [dtype, allerg].filter(Boolean).join(" · ");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(90, 90, 90);
      let t = sub;
      while (t.length > 1 && doc.getTextWidth(t) > boxW-4) t = t.slice(0,-1);
      if (t !== sub) t += "…";
      doc.text(t, cx, y+boxH-4.8, { align: "center" });
    }

    // ── Main content: centred between top padding and separator ───────────
    const contentTop = y + 2;
    const contentBot = sepY - 1;
    const contentMid = (contentTop + contentBot) / 2;

    // Measure total height
    let totalH = 0;
    let nameLines: string[] = [];
    const gap = count === 1 ? 2 : 1.5;
    const lineH = fs * 0.352778 * 1.3;   // pt → mm × line-height

    if (customer) totalH += lineH;
    if (customer && (dishName||letter)) totalH += gap;
    if (dishName) {
      doc.setFontSize(fs);
      nameLines = doc.splitTextToSize(dishName, boxW - 5);
      const maxLines = count === 1 ? 3 : 2;
      if (nameLines.length > maxLines) nameLines = nameLines.slice(0, maxLines);
      totalH += nameLines.length * lineH;
    }
    if (dishName && letter) totalH += gap;
    if (letter) totalH += (letter.length > 2 ? cr*1.5 : cr*2);

    let dy = contentMid - totalH / 2;

    // Customer name
    if (customer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fs);
      doc.setTextColor(0, 0, 0);
      doc.text(customer, cx, dy + lineH*0.75, { align: "center" });
      dy += lineH;
      if (dishName||letter) dy += gap;
    }

    // Dish name
    if (dishName) {
      doc.setFont("helvetica", count===1 ? "bold" : "normal");
      doc.setFontSize(fs);
      doc.setTextColor(20, 20, 20);
      doc.setLineHeightFactor(1.3);
      doc.text(nameLines, cx, dy + lineH*0.75, { align: "center" });
      doc.setLineHeightFactor(1.15);
      dy += nameLines.length * lineH;
      if (letter) dy += gap;
    }

    // Dish letter
    if (letter) {
      doc.setDrawColor(0,0,0);
      doc.setLineWidth(0.35);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0,0,0);
      if (letter.length > 2) {
        doc.setFontSize(fs - 1);
        const tw = doc.getTextWidth(letter);
        const bw = Math.max(tw+6,10), bh = cr*1.5;
        doc.roundedRect(cx-bw/2, dy, bw, bh, 1, 1);
        doc.text(letter, cx, dy+bh/2, { align:"center", baseline:"middle" });
      } else {
        doc.circle(cx, dy+cr, cr);
        doc.setFontSize(fs + (count<=1?2:0));
        doc.text(letter, cx, dy+cr, { align:"center", baseline:"middle" });
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
