import { jsPDF } from "jspdf";
import { LabelData } from "../types";
import { DEFAULT_LOGO_URL } from "../components/LabelPreview";

const createPDFDoc = (data: LabelData[], logoUrl?: string): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Page layout (auto-fits 3×7 = 21 labels on A4 210×297mm) ──────────────
  const columns     = 3;
  const rowsPerPage = 7;
  const itemsPerPage = columns * rowsPerPage;

  const pageW = 210, pageH = 297;
  const marginX = 7, marginY = 12;          // left/top margin
  const gapX = 3, gapY = 2;                 // gap between labels

  // auto-calculate box size to fill the page perfectly
  const boxWidth  = (pageW - 2 * marginX - (columns - 1) * gapX) / columns;        // ~63.67mm
  const boxHeight = (pageH - 2 * marginY - (rowsPerPage - 1) * gapY) / rowsPerPage; // ~37.57mm
  const cornerRadius = 2;

  // Resolve logo
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;
  let logoFormat: string | null = null;
  let logoData:   string | null = null;
  if (effectiveLogo.startsWith("data:image/png"))  { logoFormat = "PNG";  logoData = effectiveLogo; }
  if (effectiveLogo.startsWith("data:image/jpeg") ||
      effectiveLogo.startsWith("data:image/jpg"))  { logoFormat = "JPEG"; logoData = effectiveLogo; }

  // Expand quantities (qty=0 → 0 copies; null/undefined → 1)
  const expandedData: LabelData[] = [];
  data.forEach(item => {
    const qty = item.quantity ?? 1;
    for (let i = 0; i < qty; i++) expandedData.push(item);
  });

  expandedData.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) doc.addPage();

    const pos     = index % itemsPerPage;
    const col     = pos % columns;
    const row     = Math.floor(pos / columns);
    const x       = marginX + col * (boxWidth + gapX);
    const y       = marginY + row * (boxHeight + gapY);
    const cx      = x + boxWidth / 2;   // horizontal centre of label

    // ── Box border ──────────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius);

    // ── Watermark (PNG/JPEG only, low opacity) ──────────────────────────────
    if (logoData && logoFormat) {
      try {
        doc.saveGraphicsState();
        (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
        const wmW = 46, wmH = 8;
        doc.addImage(logoData, logoFormat, cx - wmW / 2, y + (boxHeight - wmH) / 2, wmW, wmH);
        doc.restoreGraphicsState();
      } catch (_) { /* GState not supported — skip watermark */ }
    }

    // ── Content fields ───────────────────────────────────────────────────────
    const customerName = (item.customerName || "").trim().toUpperCase();
    const dishName     = (item.dishName     || "").trim();
    const dishLetter   = (item.dishLetter   || "").toUpperCase().trim();
    const dishType     = (item.dishType     || "").trim().toUpperCase();
    const allergens    = (item.allergens    || "").trim().toUpperCase();
    const brandText    = (item.brand        || "BELLABONA").toUpperCase();

    // ── Layout zones ─────────────────────────────────────────────────────────
    // Header zone (customer name) — only if present
    const headerH  = customerName ? 8 : 0;
    // Footer zone (brand ± allergens ± dishType)
    const footerLines  = [dishType, allergens, brandText].filter(Boolean);
    const footerH  = footerLines.length * 3.5 + 1;   // ~3.5mm per line + 1mm padding
    // Vertical padding inside the box
    const padY  = 2;

    const headerTop  = y + padY;
    const footerBottom = y + boxHeight - padY;
    const bodyTop    = headerTop + headerH + (headerH ? 1 : 0);
    const bodyBottom = footerBottom - footerH;
    const bodyMid    = (bodyTop + bodyBottom) / 2;

    // ── 1. Customer Name ─────────────────────────────────────────────────────
    if (customerName) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(customerName, cx, headerTop + 5, { align: "center" });
    }

    // ── 2 + 3. Body: Dish Name + Dish Letter (vertically centred) ────────────
    const hasDishName   = !!dishName;
    const hasDishLetter = !!dishLetter;

    if (hasDishName || hasDishLetter) {
      // Estimate body content height
      let dishNameLines: string[] = [];
      let bodyContentH = 0;

      if (hasDishName) {
        doc.setFontSize(9);
        dishNameLines = doc.splitTextToSize(dishName, boxWidth - 5);
        if (dishNameLines.length > 2) dishNameLines = dishNameLines.slice(0, 2);
        bodyContentH += dishNameLines.length * 4.5;  // ~4.5mm per line at 9pt
      }
      if (hasDishName && hasDishLetter) bodyContentH += 2; // gap between text and circle
      if (hasDishLetter) bodyContentH += (dishLetter.length > 2 ? 7 : 9); // box 7mm, circle 9mm (diameter)

      let drawY = bodyMid - bodyContentH / 2;

      // Draw dish name
      if (hasDishName) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setLineHeightFactor(1.3);
        doc.text(dishNameLines, cx, drawY + 3.5, { align: "center" });
        doc.setLineHeightFactor(1.15);
        drawY += dishNameLines.length * 4.5;
        if (hasDishLetter) drawY += 2;
      }

      // Draw dish letter
      if (hasDishLetter) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        if (dishLetter.length > 2) {
          doc.setFontSize(9);
          const tw = doc.getTextWidth(dishLetter);
          const bw = Math.max(tw + 6, 12), bh = 7;
          const rx = cx - bw / 2;
          doc.roundedRect(rx, drawY, bw, bh, 1, 1);
          doc.text(dishLetter, cx, drawY + bh / 2, { align: "center", baseline: "middle" });
          drawY += bh;
        } else {
          const r = 4.5;
          const cy2 = drawY + r;
          doc.circle(cx, cy2, r);
          doc.setFontSize(12);
          doc.text(dishLetter, cx, cy2, { align: "center", baseline: "middle" });
          drawY += r * 2;
        }
      }
    }

    // ── Footer: Dish Type → Allergens → Brand (bottom up then reverse) ────────
    // Draw from bottom up for proper spacing
    let fy = footerBottom;
    const drawFooterLine = (text: string, size = 6.5) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(0, 0, 0);
      // Truncate if too wide
      let t = text;
      while (t.length > 1 && doc.getTextWidth(t) > boxWidth - 4) t = t.slice(0, -1);
      if (t !== text) t += "…";
      doc.text(t, cx, fy, { align: "center" });
      fy -= 3.5;
    };

    // Draw bottom-up: brand first, then allergens, then dishType
    drawFooterLine(brandText);
    if (allergens) drawFooterLine(allergens);
    if (dishType)  drawFooterLine(dishType);
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
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, "_blank");
  if (!w) alert("Please allow popups to open the print dialog.");
};

export const generatePDF = downloadPDF;
