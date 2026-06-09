import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Page layout: auto-fit 3×7 = 21 labels on A4 (210×297 mm) ─────────────
  const columns     = 3;
  const rowsPerPage = 7;
  const itemsPerPage = columns * rowsPerPage;

  const pageW = 210, pageH = 297;
  const marginX = 8,  marginY = 10;   // outer page margins
  const gapX    = 3,  gapY   = 2;    // gaps between labels

  const boxWidth  = (pageW - 2*marginX - (columns-1)*gapX)     / columns;     // ~60.67 mm
  const boxHeight = (pageH - 2*marginY - (rowsPerPage-1)*gapY) / rowsPerPage; // ~37.43 mm
  const cornerR   = 2;

  // Resolve logo (PNG/JPEG supported by jsPDF; SVG = HTML preview only)
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;
  let logoFmt: string | null = null;
  let logoData: string | null = null;
  if (effectiveLogo.startsWith("data:image/png"))                              { logoFmt = "PNG";  logoData = effectiveLogo; }
  if (effectiveLogo.startsWith("data:image/jpeg")||effectiveLogo.startsWith("data:image/jpg")) { logoFmt = "JPEG"; logoData = effectiveLogo; }

  // Expand quantities
  const expanded: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) expanded.push(item);
  });

  expanded.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) doc.addPage();

    const pos = index % itemsPerPage;
    const col = pos % columns;
    const row = Math.floor(pos / columns);
    const x   = marginX + col * (boxWidth + gapX);
    const y   = marginY + row * (boxHeight + gapY);
    const cx  = x + boxWidth / 2;

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerR, cornerR);

    // Watermark (PNG/JPEG only)
    if (logoData && logoFmt) {
      try {
        doc.saveGraphicsState();
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
        const ww = 44, wh = 7.5;
        doc.addImage(logoData, logoFmt, cx - ww/2, y + (boxHeight-wh)/2, ww, wh);
        doc.restoreGraphicsState();
      } catch (_) {}
    }

    // ── Field values ──────────────────────────────────────────────────────────
    const customer  = (item.customerName || "").trim().toUpperCase();
    const dishName  = (item.dishName     || "").trim();
    const letter    = (item.dishLetter   || "").toUpperCase().trim();
    const dtype     = (item.dishType     || "").trim().toUpperCase();
    const allerg    = (item.allergens    || "").trim().toUpperCase();
    const brand     = (item.brand        || "BELLABONA").toUpperCase();

    // ── Footer: pinned at bottom, drawn first ─────────────────────────────────
    const footerPad = 1.5;  // mm from box bottom
    const lineH     = 3.2;  // mm per footer line
    const footerLines: string[] = [brand];
    if (allerg) footerLines.unshift(allerg);
    if (dtype)  footerLines.unshift(dtype);
    const footerH = footerLines.length * lineH + footerPad;

    let fy = y + boxHeight - footerPad;
    // Draw bottom-up: brand → allergens → dishType
    const footerStack = [brand, allerg, dtype].filter(Boolean);
    footerStack.forEach(line => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      let t = line;
      while (t.length > 1 && doc.getTextWidth(t) > boxWidth - 4) t = t.slice(0, -1);
      if (t !== line) t += "…";
      doc.text(t, cx, fy, { align: "center" });
      fy -= lineH;
    });

    // ── Main content: vertically centred in (top … above footer) ─────────────
    const contentAreaTop    = y + 2;                      // 2mm padding from top
    const contentAreaBottom = y + boxHeight - footerH - 1; // 1mm gap above footer
    const contentAreaMid    = (contentAreaTop + contentAreaBottom) / 2;

    // Measure total content height
    let totalH = 0;
    let nameLines: string[] = [];
    const gap = 1.5; // mm gap between items

    if (customer) { totalH += 5.5; } // ~5.5mm for 12pt bold text
    if (customer && (dishName || letter)) totalH += gap;
    if (dishName) {
      doc.setFontSize(9);
      nameLines = doc.splitTextToSize(dishName, boxWidth - 5);
      if (nameLines.length > 2) nameLines = nameLines.slice(0, 2);
      totalH += nameLines.length * 4.2;
    }
    if (dishName && letter) totalH += gap;
    if (letter) { totalH += (letter.length > 2 ? 7 : 9); } // box=7mm, circle=9mm

    // Start drawing from (mid - totalH/2)
    let dy = contentAreaMid - totalH / 2;

    // Customer name
    if (customer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(customer, cx, dy + 4.5, { align: "center" });
      dy += 5.5;
      if (dishName || letter) dy += gap;
    }

    // Dish name
    if (dishName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setLineHeightFactor(1.3);
      doc.text(nameLines, cx, dy + 3, { align: "center" });
      doc.setLineHeightFactor(1.15);
      dy += nameLines.length * 4.2;
      if (letter) dy += gap;
    }

    // Dish letter
    if (letter) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      if (letter.length > 2) {
        doc.setFontSize(9);
        const tw = doc.getTextWidth(letter);
        const bw = Math.max(tw + 6, 12);
        const bh = 7;
        doc.roundedRect(cx - bw/2, dy, bw, bh, 1, 1);
        doc.text(letter, cx, dy + bh/2, { align: "center", baseline: "middle" });
      } else {
        const r = 4.5;
        doc.circle(cx, dy + r, r);
        doc.setFontSize(11);
        doc.text(letter, cx, dy + r, { align: "center", baseline: "middle" });
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
