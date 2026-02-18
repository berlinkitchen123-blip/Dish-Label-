import React, { useState, useEffect, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { LabelPreview } from './components/LabelPreview';
import { downloadPDF, printPDF } from './services/pdfGenerator';
import { LabelData, RawJsonItem, FieldMapping, MappingKey } from './types';
import { Printer, RefreshCcw, Check, ArrowRight, Settings2, Download, Info } from 'lucide-react';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawJsonItem[]>([]);
  const [mappedData, setMappedData] = useState<LabelData[]>([]);
  
  // Updated Mapping State for 6 fields
  const [mapping, setMapping] = useState<FieldMapping>({ 
    customerName: '', 
    dishLetter: '', 
    dishType: '', 
    dishName: '', 
    allergens: '', 
    brand: '' 
  });
  
  const [keys, setKeys] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1); 

  // Helper to flatten the nested specific JSON structure
  const preprocessNestedData = (data: any[]): any[] => {
    let flatList: any[] = [];
    let isNested = false;

    data.forEach(item => {
      if (item.boxes && Array.isArray(item.boxes)) {
        isNested = true;
        const footerName = item.deliveryName || item.name || "Unknown"; // e.g. Restaurant Name

        item.boxes.forEach((box: any) => {
          if (box.dishes && Array.isArray(box.dishes)) {
            box.dishes.forEach((dish: any) => {
              // Extract potential fields
              const dishName = dish.name || "";
              const dishLabel = dish.label || "";
              const recipeType = dish.recipeType || ""; 
              const allergens = dish.allergens ? (Array.isArray(dish.allergens) ? dish.allergens.join(", ") : dish.allergens) : "";
              
              if (dish.users && Array.isArray(dish.users) && dish.users.length > 0) {
                dish.users.forEach((user: any) => {
                  const qty = Number(user.orderedQuantity) || 0;
                  const userName = user.username || "";
                  
                  for (let i = 0; i < qty; i++) {
                    flatList.push({
                      "Customer Name": userName,
                      "Dish Letter": dishLabel,
                      "Dish Type": recipeType,
                      "Dish Name": dishName,
                      "Allergens": allergens,
                      "Restaurant": footerName,
                      _initialQty: 1 
                    });
                  }
                });
              } else {
                flatList.push({
                  "Customer Name": "",
                  "Dish Letter": dishLabel,
                  "Dish Type": recipeType,
                  "Dish Name": dishName,
                  "Allergens": allergens,
                  "Restaurant": footerName,
                  _initialQty: 1
                });
              }
            });
          }
        });
      } else {
        flatList.push(item);
      }
    });

    return isNested ? flatList : data;
  };

  const handleDataLoaded = (data: RawJsonItem[]) => {
    const processedData = preprocessNestedData(data);
    setRawData(processedData);

    if (processedData.length > 0) {
      const availableKeys = Object.keys(processedData[0]).filter(k => k !== '_initialQty');
      setKeys(availableKeys);
      
      // Smart Auto-Mapping
      const getKey = (keywords: string[]) => 
        availableKeys.find(k => keywords.some(w => k.toLowerCase().includes(w))) || '';

      const newMapping: FieldMapping = {
        customerName: getKey(['customer', 'user', 'client']),
        dishLetter: getKey(['letter', 'label', 'addon', 'code']),
        dishType: getKey(['type', 'recipe', 'category']),
        dishName: getKey(['dish name', 'item', 'content', 'product']),
        allergens: getKey(['allergen']),
        brand: getKey(['brand', 'company', 'restaurant', 'bellabona'])
      };
      
      // Fallbacks if not found
      if (!newMapping.dishName) newMapping.dishName = availableKeys[0] || '';
      
      setMapping(newMapping);
      setStep(2);
    }
  };

  useEffect(() => {
    if (rawData.length === 0) return;
    
    setMappedData(prevMapped => {
      return rawData.map((item, idx) => {
        const existingQty = prevMapped[idx] && prevMapped.length === rawData.length ? prevMapped[idx].quantity : null;
        const jsonQty = item.qty || item.quantity || item._initialQty;
        const finalQty = existingQty !== null ? existingQty : (Number(jsonQty) || 1);
        
        return {
          id: `label-${idx}`,
          customerName: item[mapping.customerName] ? String(item[mapping.customerName]) : '',
          dishLetter: item[mapping.dishLetter] ? String(item[mapping.dishLetter]) : '',
          dishType: item[mapping.dishType] ? String(item[mapping.dishType]) : '',
          dishName: item[mapping.dishName] ? String(item[mapping.dishName]) : '',
          allergens: item[mapping.allergens] ? String(item[mapping.allergens]) : '',
          brand: item[mapping.brand] ? String(item[mapping.brand]) : 'BELLABONA',
          quantity: finalQty
        };
      });
    });
  }, [rawData, mapping]);

  const handleMappingChange = (key: MappingKey, value: string) => {
    setMapping(prev => ({ ...prev, [key]: value }));
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    setMappedData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], quantity: newQty };
      return next;
    });
  };

  const handleReset = () => {
    setRawData([]);
    setMappedData([]);
    setStep(1);
  };

  const getRawValue = (obj: any, key: string) => {
    if (!obj || !key) return '';
    const val = obj[key];
    if (typeof val === 'object') return JSON.stringify(val); 
    return String(val || '');
  };

  const totalLabels = mappedData.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPages = Math.ceil(totalLabels / 21);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-green p-2 rounded-lg">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LabelGen Pro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
             {step > 1 && (
               <button onClick={handleReset} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                 <RefreshCcw className="w-4 h-4" />
                 <span>Start Over</span>
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Step 1: Input */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Generate Professional Labels</h2>
              <p className="text-lg text-gray-600">
                Paste your JSON data. Layout customized for <strong>Customer Name Styling</strong> (Double Size First Letter).
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} />
             <div className="mt-16 text-xs text-gray-300">v2.0 (Custom Layout)</div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 2 && (
          <div className="max-w-6xl mx-auto">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900">Map Data Fields</h2>
               <p className="text-gray-600">Match your JSON fields to the label layout.</p>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Visual Reference & Controls */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                     <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Label Preview</h3>
                     <div className="flex justify-center mb-6">
                       <div className="scale-90">
                        <LabelPreview 
                            data={{ 
                              id: 'demo', 
                              customerName: mapping.customerName ? getRawValue(rawData[0], mapping.customerName) || 'Harsh' : 'Harsh', 
                              dishLetter: mapping.dishLetter ? getRawValue(rawData[0], mapping.dishLetter) || 'A' : 'A', 
                              dishType: mapping.dishType ? getRawValue(rawData[0], mapping.dishType) || 'Starter' : 'Starter', 
                              dishName: mapping.dishName ? getRawValue(rawData[0], mapping.dishName) || 'Tomato Soup' : 'Tomato Soup', 
                              allergens: mapping.allergens ? getRawValue(rawData[0], mapping.allergens) || 'Gluten' : 'Gluten', 
                              brand: mapping.brand ? getRawValue(rawData[0], mapping.brand) || 'BELLABONA' : 'BELLABONA',
                              quantity: 1
                            }} 
                          />
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-brand-green uppercase">1. Customer Name</label>
                            <select value={mapping.customerName} onChange={(e) => handleMappingChange('customerName', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(None)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-green uppercase">2. Dish Letter</label>
                            <select value={mapping.dishLetter} onChange={(e) => handleMappingChange('dishLetter', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(None)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">3. Dish Type</label>
                            <select value={mapping.dishType} onChange={(e) => handleMappingChange('dishType', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(None)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                           <div>
                            <label className="text-xs font-bold text-gray-900 uppercase">4. Dish Name</label>
                            <select value={mapping.dishName} onChange={(e) => handleMappingChange('dishName', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(None)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-brand-pink uppercase">5. Allergens</label>
                            <select value={mapping.allergens} onChange={(e) => handleMappingChange('allergens', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(None)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">6. Brand</label>
                            <select value={mapping.brand} onChange={(e) => handleMappingChange('brand', e.target.value)} className="w-full text-xs rounded border-gray-300 mt-1">
                              <option value="">(Default: BELLABONA)</option>
                              {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="lg:col-span-7">
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[600px]">
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Label Data ({totalLabels})</h3>
                      </div>
                      <div className="flex-grow overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                             <tr>
                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label Content</th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Qty</th>
                             </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {mappedData.map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                   <div className="flex justify-between">
                                      <span className="font-bold text-brand-green">{row.customerName || "-"}</span>
                                      <span className="font-bold text-brand-green">{row.dishLetter}</span>
                                   </div>
                                   <div className="text-xs text-gray-500">{row.dishType}</div>
                                   <div className="font-medium">{row.dishName}</div>
                                   <div className="text-xs text-brand-pink">{row.allergens}</div>
                                </td>
                                <td className="px-4 py-3">
                                   <input type="number" min="0" value={row.quantity} onChange={(e) => handleQuantityChange(i, parseInt(e.target.value) || 0)} className="w-16 text-sm rounded border-gray-300 p-1" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button onClick={() => setStep(3)} className="w-full flex items-center justify-center space-x-2 bg-brand-green hover:bg-green-900 text-white px-6 py-3 rounded-lg font-medium shadow-sm">
                           <span>Preview & Print</span>
                           <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div>
             <div className="flex justify-between mb-8">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
                 <p className="text-gray-600">{totalLabels} labels • {totalPages} pages (A4).</p>
               </div>
               <div className="flex space-x-3">
                  <button onClick={() => setStep(2)} className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                    <Settings2 className="w-4 h-4" /> <span>Edit</span>
                  </button>
                  <button onClick={() => downloadPDF(mappedData)} className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                    <Download className="w-4 h-4" /> <span>Download</span>
                  </button>
                  <button onClick={() => printPDF(mappedData)} className="flex items-center space-x-2 bg-brand-green text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-green-900">
                    <Printer className="w-4 h-4" /> <span>Print</span>
                  </button>
               </div>
             </div>
             
             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 overflow-x-auto min-h-[600px] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 max-w-5xl mx-auto">
                  {mappedData.flatMap((item, idx) => 
                     Array(item.quantity).fill(null).map((_, copyIdx) => (
                        <div key={`${idx}-${copyIdx}`} className="relative group">
                          <LabelPreview data={item} />
                        </div>
                     ))
                  )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;