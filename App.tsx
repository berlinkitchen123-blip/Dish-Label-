import React, { useState, useEffect, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { LabelPreview } from './components/LabelPreview';
import { downloadPDF, printPDF } from './services/pdfGenerator';
import { LabelData, RawJsonItem, FieldMapping, MappingKey } from './types';
import { Printer, RefreshCcw, Check, ArrowRight, Settings2, Download, Info } from 'lucide-react';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawJsonItem[]>([]);
  const [mappedData, setMappedData] = useState<LabelData[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({ header: '', content: '', footer: '', subFooter: '' });
  const [keys, setKeys] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1); // 1: Input, 2: Map, 3: Preview

  // Helper to flatten the nested specific JSON structure provided by user
  const preprocessNestedData = (data: any[]): any[] => {
    let flatList: any[] = [];
    let isNested = false;

    data.forEach(item => {
      // Check for specific structure: has boxes array and deliveryName or name
      if (item.boxes && Array.isArray(item.boxes)) {
        isNested = true;
        const footerName = item.deliveryName || item.name || "Unknown";

        item.boxes.forEach((box: any) => {
          if (box.dishes && Array.isArray(box.dishes)) {
            box.dishes.forEach((dish: any) => {
              const dishName = dish.name || "";
              const dishLabel = dish.label || "";
              
              // If users array exists, create a label for each user based on quantity
              if (dish.users && Array.isArray(dish.users) && dish.users.length > 0) {
                dish.users.forEach((user: any) => {
                  const qty = Number(user.orderedQuantity) || 0;
                  const userName = user.username || "";
                  
                  // Create a label for each item ordered by this user
                  for (let i = 0; i < qty; i++) {
                    flatList.push({
                      "Dish Letter": dishLabel,
                      "Dish Name": dishName,
                      "Restaurant Name": footerName,
                      "User Name": userName,
                      "Restaurant & User": userName ? `${userName} - ${footerName}` : footerName
                    });
                  }
                });
              } else {
                // Fallback if no users defined, create one generic label
                flatList.push({
                  "Dish Letter": dishLabel,
                  "Dish Name": dishName,
                  "Restaurant Name": footerName,
                  "User Name": "",
                  "Restaurant & User": footerName
                });
              }
            });
          }
        });
      } else {
        // If not nested structure, keep original
        flatList.push(item);
      }
    });

    return isNested ? flatList : data;
  };

  // Handle data load
  const handleDataLoaded = (data: RawJsonItem[]) => {
    const processedData = preprocessNestedData(data);
    setRawData(processedData);

    if (processedData.length > 0) {
      const availableKeys = Object.keys(processedData[0]);
      setKeys(availableKeys);
      
      // Auto-guess mapping if possible
      const newMapping = {
        header: availableKeys.find(k => k.toLowerCase().includes('letter') || k.toLowerCase().includes('addon')) || availableKeys[0] || '',
        content: availableKeys.find(k => k.toLowerCase().includes('dish name') || k.toLowerCase().includes('item') || k.toLowerCase().includes('content')) || availableKeys[1] || '',
        // Prioritize User Name for footer 
        footer: availableKeys.find(k => k.toLowerCase().includes('user name')) || 
                availableKeys.find(k => k.toLowerCase().includes('name') && !k.toLowerCase().includes('dish') && !k.toLowerCase().includes('rest')) || 
                availableKeys[2] || '',
        // Prioritize Restaurant Name for sub-footer
        subFooter: availableKeys.find(k => k.toLowerCase().includes('restaurant name')) ||
                   availableKeys.find(k => k.toLowerCase().includes('company')) ||
                   availableKeys.find(k => k.toLowerCase().includes('delivery')) || 
                   availableKeys[3] || ''
      };
      setMapping(newMapping);
      setStep(2);
    }
  };

  // Update mapped data when mapping or rawData changes
  useEffect(() => {
    if (rawData.length === 0) return;
    
    const transformed = rawData.map((item, idx) => ({
      id: `label-${idx}`,
      header: item[mapping.header] ? String(item[mapping.header]) : '',
      content: item[mapping.content] ? String(item[mapping.content]) : '',
      footer: item[mapping.footer] ? String(item[mapping.footer]) : '',
      subFooter: item[mapping.subFooter] ? String(item[mapping.subFooter]) : '',
    }));
    setMappedData(transformed);
  }, [rawData, mapping]);

  const handleMappingChange = (key: MappingKey, value: string) => {
    setMapping(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setRawData([]);
    setMappedData([]);
    setStep(1);
  };

  const totalPages = Math.ceil(mappedData.length / 21);

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
               <button 
                onClick={handleReset}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
               >
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
                Paste your JSON data below. Layout optimized for <strong>63mm x 38mm</strong> labels on A4 (3x7 grid).
              </p>
            </div>
            
            <FileUpload onDataLoaded={handleDataLoaded} />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 w-full max-w-4xl">
              {[
                { title: "Input Data", desc: "Paste JSON (flat or nested)" },
                { title: "Map Fields", desc: "Auto-detects labels, users & company" },
                { title: "Print Labels", desc: "3x7 Layout (21 labels/page)" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                  <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900">Map Your Data</h2>
               <p className="text-gray-600">Select which fields from your JSON correspond to the label layout.</p>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
               <div className="p-6 grid gap-6">
                 {/* Visual Reference */}
                 <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="scale-75 origin-center">
                       <LabelPreview 
                          data={{ 
                            id: 'demo', 
                            header: mapping.header ? (rawData[0][mapping.header] || 'Header') : 'Header', 
                            content: mapping.content ? (rawData[0][mapping.content] || 'Content') : 'Content', 
                            footer: mapping.footer ? (rawData[0][mapping.footer] || 'Footer') : 'Footer',
                            subFooter: mapping.subFooter ? (rawData[0][mapping.subFooter] || 'SubFooter') : 'SubFooter'
                          }} 
                        />
                    </div>
                 </div>

                 {/* Mapping Controls */}
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-brand-green mb-1 uppercase tracking-wide">1. Header (Top)</label>
                       <p className="text-xs text-gray-500 mb-2">e.g. Dish Letter</p>
                       <select 
                          value={mapping.header} 
                          onChange={(e) => handleMappingChange('header', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green focus:ring focus:ring-brand-green/20"
                        >
                          {keys.map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">2. Content (Middle)</label>
                        <p className="text-xs text-gray-500 mb-2">e.g. Dish Name</p>
                       <select 
                          value={mapping.content} 
                          onChange={(e) => handleMappingChange('content', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green focus:ring focus:ring-brand-green/20"
                        >
                          {keys.map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                     <div>
                       <label className="block text-sm font-medium text-brand-pink mb-1 uppercase tracking-wide">3. Footer (Bottom)</label>
                        <p className="text-xs text-gray-500 mb-2">e.g. User Name</p>
                       <select 
                          value={mapping.footer} 
                          onChange={(e) => handleMappingChange('footer', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green focus:ring focus:ring-brand-green/20"
                        >
                          {keys.map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">4. Sub-Footer (End)</label>
                        <p className="text-xs text-gray-500 mb-2">e.g. Company Name</p>
                       <select 
                          value={mapping.subFooter} 
                          onChange={(e) => handleMappingChange('subFooter', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green focus:ring focus:ring-brand-green/20"
                        >
                          {keys.map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                 <span className="text-sm text-gray-500">{mappedData.length} items found</span>
                 <button 
                    onClick={() => setStep(3)}
                    className="flex items-center space-x-2 bg-brand-green hover:bg-green-900 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                 >
                   <span>Preview & Print</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div>
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
                 <p className="text-gray-600">
                   Showing {mappedData.length} labels across {totalPages} page{totalPages !== 1 ? 's' : ''}.
                 </p>
               </div>
               <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>Adjust Mapping</span>
                  </button>
                  <button 
                    onClick={() => downloadPDF(mappedData)}
                    className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={() => printPDF(mappedData)}
                    className="flex items-center space-x-2 bg-brand-green hover:bg-green-900 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-green/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Labels</span>
                  </button>
               </div>
             </div>
             
             {/* Print Instructions Alert */}
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Printing Tip:</strong> For perfect alignment, set "Scale" to <strong>100%</strong> (or "Actual Size") in your print dialog and ensure paper size is set to <strong>A4</strong>. 
                  Printing on Letter size or using "Fit to Page" will cause misalignment at the bottom.
                </div>
             </div>

             {/* Grid Preview */}
             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 overflow-x-auto min-h-[600px] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                {mappedData.length === 0 ? (
                  <div className="text-center text-gray-500 py-20">No data to display</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 max-w-5xl mx-auto">
                    {mappedData.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <LabelPreview data={item} />
                        <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
             
             <div className="mt-8 text-center text-gray-500 text-sm">
               Preview represents A4 layout: 3 columns x 7 rows (63mm x 38mm labels).
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;