import * as XLSX from "xlsx";
import { LabelData } from "../types";

const COLUMNS = ["Customer Name", "Dish Letter", "Dish Type", "Dish Name", "Allergens", "Quantity"];

export const downloadSampleExcel = () => {
  const sampleRows = [
    { "Customer Name": "JOHN",  "Dish Letter": "A", "Dish Type": "HOT",  "Dish Name": "Butter Chicken with Rice", "Allergens": "GLUTEN", "Quantity": 1 },
    { "Customer Name": "SARAH", "Dish Letter": "V", "Dish Type": "COLD", "Dish Name": "Garden Green Salad",        "Allergens": "",       "Quantity": 2 },
    { "Customer Name": "ALI",   "Dish Letter": "B", "Dish Type": "HOT",  "Dish Name": "Parmigiana",                "Allergens": "DAIRY",  "Quantity": 1 },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: COLUMNS });

  // Column widths
  ws["!cols"] = [
    { wch: 18 }, { wch: 12 }, { wch: 12 },
    { wch: 32 }, { wch: 16 }, { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Labels");
  XLSX.writeFile(wb, "bellabona_labels_sample.xlsx");
};

let rowCounter = 0;
export const parseExcelToLabels = (file: File): Promise<LabelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

        const labels: LabelData[] = rows.map((row) => ({
          id:           `excel-${++rowCounter}`,
          customerName: String(row["Customer Name"] ?? ""),
          dishLetter:   String(row["Dish Letter"]   ?? ""),
          dishType:     String(row["Dish Type"]     ?? ""),
          dishName:     String(row["Dish Name"]     ?? ""),
          allergens:    String(row["Allergens"]     ?? ""),
          brand:        "BELLABONA",
          quantity:     Math.max(0, parseInt(String(row["Quantity"] ?? "1")) || 1),
        }));

        resolve(labels);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
