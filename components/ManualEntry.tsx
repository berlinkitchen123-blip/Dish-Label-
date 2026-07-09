import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, UserCheck, Utensils } from 'lucide-react';

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
    // Format items so that App.tsx maps them cleanly
    const formatted = items.map(item => ({
      "Customer Name": item.customerName,
      "Dish Letter": item.dishLetter,
      "Dish Type": item.dishType,
      "Dish Name": item.dishName,
      "Allergens": item.allergens,
      "Brand": item.brand,
      "Quantity": item.quantity,
      _initialQty: item.quantity
    }));
    onDataLoaded(formatted);
  };

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

        {/* Added Items Table */}
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

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={items.length === 0}
            className="flex items-center space-x-2 bg-brand-green hover:bg-green-900 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all"
          >
            <span>Generate Labels ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
