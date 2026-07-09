import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Printer, Utensils } from 'lucide-react';

interface ManualEntryProps {
  onDataLoaded: (data: any[]) => void;
}

interface ManualItem {
  customerName: string;
  dishLetter: string;
  dishType: string;
  dishName: string;
  allergens: string;
  brand: string;
  quantity: number;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ onDataLoaded }) => {
  const [items, setItems] = useState<ManualItem[]>([
    {
      customerName: 'JANE DOE',
      dishLetter: 'A',
      dishType: 'MAIN COURSE',
      dishName: 'TRUFFLE RISOTTO',
      allergens: 'DAIRY, MUSHROOMS',
      brand: 'BELLABONA',
      quantity: 1
    }
  ]);

  const [current, setCurrent] = useState<ManualItem>({
    customerName: '',
    dishLetter: 'A',
    dishType: '',
    dishName: '',
    allergens: '',
    brand: 'BELLABONA',
    quantity: 1
  });

  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.dishName.trim()) {
      setError('Dish Name is required.');
      return;
    }
    setError(null);
    setItems([...items, current]);
    setCurrent({
      customerName: '',
      dishLetter: 'A',
      dishType: '',
      dishName: '',
      allergens: '',
      brand: current.brand || 'BELLABONA',
      quantity: 1
    });
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (items.length === 0) {
      setError('Please add at least one label item.');
      return;
    }
    setError(null);
    setShowPreview(true);
  };

  const expandedLabels = items.flatMap(item =>
    Array(item.quantity).fill(item)
  );

  const totalLabelCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPages = Math.ceil(totalLabelCount / 21);

  if (showPreview) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body > * { display: none !important; }
            #bb-label-print-root { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; }
            #bb-label-print-root .no-print { display: none !important; }
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          #bb-label-print-root .label-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4mm;
            width: 100%;
          }
          #bb-label-print-root .label-cell {
            border: 0.5px solid #e5e7eb;
            border-radius: 3px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 76px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          #bb-label-print-root .label-dish {
            color: #e91e8c;
            font-weight: 700;
            font-size: 13px;
            text-align: center;
            line-height: 1.25;
            text-transform: uppercase;
            word-break: break-word;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #bb-label-print-root .label-divider {
            width: 80%;
            height: 1px;
            background-color: #e91e8c;
            margin: 5px 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #bb-label-print-root .label-brand {
            font-weight: 700;
            font-size: 10px;
            text-align: center;
            text-transform: uppercase;
            color: #111827;
            letter-spacing: 0.08em;
          }
        `}} />

        <div id="bb-label-print-root">
          <div className="no-print mb-6 flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>
            <div className="text-sm text-gray-500">
              {totalLabelCount} label{totalLabelCount !== 1 ? 's' : ''} &mdash; {totalPages} page{totalPages !== 1 ? 's' : ''} (A4, 3&times;7)
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 bg-brand-green hover:bg-green-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <div className="label-grid">
            {expandedLabels.map((item, idx) => (
              <div key={idx} className="label-cell">
                <div className="label-dish">{item.dishName}</div>
                <div className="label-divider" />
                <div className="label-brand">{item.brand || 'BELLABONA'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-brand-green/10 p-2 rounded-lg">
            <Utensils className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manual Label Entry</h3>
            <p className="text-xs text-gray-500">Add individual items or orders manually</p>
          </div>
        </div>

        <form onSubmit={handleAddItem} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. JOHN SMITH"
                value={current.customerName}
                onChange={e => setCurrent({ ...current, customerName: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dish Letter</label>
              <input
                type="text"
                placeholder="e.g. A"
                value={current.dishLetter}
                onChange={e => setCurrent({ ...current, dishLetter: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dish Type</label>
              <input
                type="text"
                placeholder="e.g. MAIN / STARTER"
                value={current.dishType}
                onChange={e => setCurrent({ ...current, dishType: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dish Name *</label>
              <input
                type="text"
                placeholder="e.g. TRUFFLE RISOTTO"
                value={current.dishName}
                onChange={e => setCurrent({ ...current, dishName: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Allergens</label>
              <input
                type="text"
                placeholder="e.g. DAIRY, NUTS"
                value={current.allergens}
                onChange={e => setCurrent({ ...current, allergens: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Brand / Restaurant</label>
              <input
                type="text"
                placeholder="BELLABONA"
                value={current.brand}
                onChange={e => setCurrent({ ...current, brand: e.target.value })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={current.quantity}
                onChange={e => setCurrent({ ...current, quantity: parseInt(e.target.value) || 1 })}
                className="w-full text-sm rounded border-gray-300 p-2 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add to List</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h4 className="font-semibold text-gray-900 text-sm">Added Items ({items.length})</h4>
          </div>
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No items added yet. Use the form above to add labels.</div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 text-sm">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{item.dishName}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-700">{item.dishLetter}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Customer: <strong className="text-gray-700">{item.customerName || '-'}</strong> | Type: {item.dishType || '-'} | Qty: {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={items.length === 0}
            className="flex items-center space-x-2 bg-brand-green hover:bg-green-900 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Labels ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
