import React, { useState, useRef } from 'react';
import { LabelPreview, DEFAULT_LOGO_URL } from "./LabelPreview";
import { downloadPDF, printPDF } from '../services/pdfGenerator';
import { LabelData } from '../types';
import { Plus, Trash2, Download, Printer, ArrowLeft, Upload, X, Copy } from 'lucide-react';

interface ManualLabelBuilderProps {
  onBack: () => void;
}

let rowCounter = 0;
const newRow = (): LabelData => ({
  id: `manual-${++rowCounter}`,
  customerName: '',
  dishLetter: '',
  dishType: '',
  dishName: '',
  allergens: '',
  brand: 'BELLABONA',
  quantity: 1,
});

export const ManualLabelBuilder: React.FC<ManualLabelBuilderProps> = ({ onBack }) => {
  const [rows, setRows] = useState<LabelData[]>([newRow()]);
  const [logoUrl, setLogoUrl] = useState<string | null>(DEFAULT_LOGO_URL);
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addRow = () => {
    setRows(prev => [...prev, newRow()]);
  };

  const updateRow = (idx: number, field: keyof LabelData, value: string | number) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const deleteRow = (idx: number) => {
    setRows(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [newRow()];
    });
    setPreviewIndex(prev => Math.min(prev, Math.max(0, rows.length - 2)));
  };

  const duplicateRow = (idx: number) => {
    setRows(prev => {
      const copy = { ...prev[idx], id: `manual-${++rowCounter}` };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const totalLabels = rows.reduce((acc, r) => acc + Math.max(0, r.quantity || 1), 0);
  const safePreviewIndex = Math.min(previewIndex, rows.length - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to JSON</span>
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">Manual Label Builder</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{totalLabels} labels</span>
            <button
              onClick={() => downloadPDF(rows, logoUrl ?? undefined)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => printPDF(rows, logoUrl ?? undefined)}
              className="flex items-center space-x-2 bg-brand-green text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-green-900 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Logo + Live Preview */}
          <div className="lg:col-span-4 space-y-4">

            {/* Logo upload */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Brand Logo
              </h3>
              {logoUrl ? (
                <div className="relative flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img src={logoUrl} alt="Logo" className="max-h-16 max-w-full object-contain" />
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow border border-gray-200 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-green hover:bg-green-50/30 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload PNG / JPEG / SVG</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-gray-400 mt-2">
                Shown on every label. PNG/JPEG also embeds in PDF.
              </p>
            </div>

            {/* Live label preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">
                Preview — Row {safePreviewIndex + 1}
              </h3>
              <div className="flex justify-center mb-4">
                <LabelPreview
                  data={rows[safePreviewIndex] ?? rows[0]}
                  logoUrl={logoUrl ?? undefined}
                />
              </div>

              {/* Row selector dots */}
              {rows.length > 1 && (
                <div className="flex justify-center flex-wrap gap-1.5 mt-2">
                  {rows.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={`w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                        i === safePreviewIndex
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Multi-row table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  Label Rows
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({rows.length} row{rows.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <button
                  onClick={addRow}
                  className="flex items-center space-x-1.5 bg-brand-green text-white text-sm px-4 py-2 rounded-lg hover:bg-green-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-400 w-8">#</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Customer</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Letter</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Dish Type</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Dish Name</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Allergens</th>
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
                      <th className="px-2 py-2.5 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`transition-colors cursor-pointer ${
                          i === safePreviewIndex ? 'bg-green-50/50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setPreviewIndex(i)}
                      >
                        <td className="px-2 py-2 text-xs text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.customerName}
                            onChange={e => updateRow(i, 'customerName', e.target.value)}
                            placeholder="John Doe"
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.dishLetter}
                            onChange={e => updateRow(i, 'dishLetter', e.target.value)}
                            placeholder="A"
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.dishType}
                            onChange={e => updateRow(i, 'dishType', e.target.value)}
                            placeholder="Starter"
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.dishName}
                            onChange={e => updateRow(i, 'dishName', e.target.value)}
                            placeholder="Tomato Soup"
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.allergens}
                            onChange={e => updateRow(i, 'allergens', e.target.value)}
                            placeholder="Gluten"
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <input
                            type="number"
                            min="0"
                            className="w-14 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-brand-green transition-colors"
                            value={row.quantity}
                            onChange={e => updateRow(i, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                          />
                        </td>
                        <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => duplicateRow(i)}
                              title="Duplicate row"
                              className="p-1 text-gray-400 hover:text-brand-green rounded transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRow(i)}
                              title="Delete row"
                              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={addRow}
                  className="flex items-center space-x-1.5 text-sm text-brand-green hover:text-green-800 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another row</span>
                </button>
                <span className="text-sm text-gray-500">{totalLabels} total labels to print</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
