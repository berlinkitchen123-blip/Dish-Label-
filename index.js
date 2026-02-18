import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClipboardPaste, AlertCircle, ArrowRight, FileJson, Printer, RefreshCcw, Settings2, Download, Info } from 'lucide-react';
import { jsPDF } from "jspdf";

// ----------------------------------------------------------------------
// PDF GENERATOR SERVICE
// ----------------------------------------------------------------------

const createPDFDoc = (data) => {
  // A4 dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Layout Specification ---
  const columns = 3;
  const rows = 7;
  const itemsPerPage = columns * rows;
  
  const boxWidth = 63; 
  const boxHeight = 38; 
  const cornerRadius = 2; 
  
  const horizontalGap = 3;
  const verticalGap = 0; 
  
  const startX = 7;  
  const startY = 15.5; 

  data.forEach((item, index) => {
    // Check if we need a new page
    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage();
    }

    const positionOnPage = index % itemsPerPage;
    const colIndex = positionOnPage % columns;
    const rowIndex = Math.floor(positionOnPage / columns);

    const x = startX + (colIndex * (boxWidth + horizontalGap));
    const y = startY + (rowIndex * (boxHeight + verticalGap));

    // --- Draw Box Border ---
    doc.setDrawColor(200, 200, 200); 
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, boxWidth, boxHeight, cornerRadius, cornerRadius, "S");

    const centerX = x + (boxWidth / 2);

    // ==========================================
    // 1. Customer Name (Top Center, First Letter Double Size)
    // ==========================================
    const customerName = (item.customerName || "").toUpperCase();
    
    if (customerName) {
        const firstChar = customerName.charAt(0);
        const rest = customerName.slice(1);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(23, 64, 52); // Brand Green

        // Calculate total width to center the combined text
        doc.setFontSize(24); // Double size
        const w1 = doc.getTextWidth(firstChar);

        doc.setFontSize(12); // Regular size
        const w2 = doc.getTextWidth(rest);

        const totalWidth = w1 + w2;
        const textStartX = centerX - (totalWidth / 2);

        // Draw First Char
        doc.setFontSize(24);
        doc.text(firstChar, textStartX, y + 9);

        // Draw Rest
        doc.setFontSize(12);
        doc.text(rest, textStartX + w1, y + 9);
    } else {
        // Fallback for empty name
        doc.setFont("helvetica", "bold");
        doc.setTextColor(23, 64, 52); 
        doc.setFontSize(14);
        doc.text("CUSTOMER", centerX, y + 9, { align: "center" });
    }

    // ==========================================
    // 2. Dish Name (Below Name)
    // ==========================================
    const dishName = item.dishName || "";
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    
    const contentLines = doc.splitTextToSize(dishName, boxWidth - 6);
    const maxLines = 2;
    const displayLines = contentLines.length > maxLines ? contentLines.slice(0, maxLines) : contentLines;
    
    doc.text(displayLines, centerX, y + 14, { align: "center" });

    // ==========================================
    // 3. Dish Letter (Round Circle)
    // ==========================================
    const dishLetter = (item.dishLetter || "A").toUpperCase();
    
    const circleY = y + 24;
    const circleRadius = 4;
    
    // Draw Circle
    doc.setDrawColor(23, 64, 52); // Brand Green Border
    doc.setLineWidth(0.4);
    doc.circle(centerX, circleY, circleRadius, "S"); // S = Stroke

    // Draw Letter
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(23, 64, 52);
    // Offset Y slightly for vertical centering in PDF
    doc.text(dishLetter, centerX, circleY + 1.5, { align: "center", baseline: "bottom" });

    // ==========================================
    // 4. Allergens (Small, Bottom)
    // ==========================================
    const allergens = (item.allergens || "").toUpperCase();
    if (allergens) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(230, 126, 140); // Pink
      doc.text(allergens, centerX, y + 32, { align: "center" });
    }

    // ==========================================
    // 5. Restaurant (Footer)
    // ==========================================
    const brandText = (item.brand || "RESTAURANT").toUpperCase();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100); // Gray
    doc.text(brandText, centerX, y + 36, { align: "center" });

  });

  return doc;
};

const downloadPDF = (data) => {
  const doc = createPDFDoc(data);
  doc.save("labels.pdf");
};

const printPDF = (data) => {
  const doc = createPDFDoc(data);
  doc.autoPrint(); 
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  
  // Direct Print via Iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.left = '-10000px';
  iframe.src = url;
  
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    setTimeout(() => {
        try {
            iframe.contentWindow?.print();
        } catch (e) { console.error(e); }
    }, 500);
  };
};

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

// -- FileUpload Component --
const FileUpload = ({ onDataLoaded }) => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);

  const handleProcess = () => {
    setError(null);
    if (!jsonText.trim()) {
      setError("Please paste some JSON data.");
      return;
    }

    try {
      const cleanText = jsonText
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

      const json = JSON.parse(cleanText);
      
      if (Array.isArray(json)) {
        onDataLoaded(json);
      } else if (typeof json === 'object' && json !== null) {
        onDataLoaded([json]);
      } else {
        setError("JSON must be an array of objects or a single object.");
      }
    } catch (err) {
      setError("Invalid JSON format. Please check for missing commas, quotes, or brackets.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-green/10 p-2 rounded-lg">
              <ClipboardPaste className="w-5 h-5 text-brand-green" />
            </div>
            <h3 className="font-semibold text-gray-900">Paste JSON Data</h3>
          </div>
          <div className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200">
            Object or Array
          </div>
        </div>
        <div className="p-0">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={'{\n  "name": "Parloa - Berlin",\n  "boxes": [\n    {\n      "dishes": [\n        { "name": "Chicken", "label": "A", "users": [{ "orderedQuantity": 1 }] }\n      ]\n    }\n  ]\n}'}
            className={`w-full h-80 p-6 font-mono text-sm text-gray-800 bg-white border-none focus:ring-0 resize-y outline-none placeholder-gray-300 ${
              error ? 'bg-red-50/30' : ''
            }`}
            spellCheck={false}
          />
        </div>
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
             {error ? (
              <div className="flex items-center text-red-600 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Tip: Auto-detects complex nested dish structures.
              </p>
            )}
          </div>
          <button
            onClick={handleProcess}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand-green hover:bg-green-900 text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <span>Load Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// -- LabelPreview Component --
const LabelPreview = ({ data, scale = 1 }) => {
  const rawName = (data.customerName || "").toUpperCase();
  const firstChar = rawName.charAt(0);
  const restOfName = rawName.slice(1);
  const dishLetter = (data.dishLetter || "A").toUpperCase();
  const brandText = (data.brand || "RESTAURANT").toUpperCase();

  return (
    <div 
      className="flex flex-col items-center mx-auto"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '240px'
      }}
    >
      <div 
        className="w-full bg-white rounded border border-gray-300 shadow-sm flex flex-col items-center p-2 relative"
        style={{ height: '145px' }} 
      >
        <div className="w-full flex justify-center items-baseline mt-2 mb-1">
            <span className="text-brand-green font-extrabold text-4xl leading-none uppercase tracking-tight">{firstChar}</span>
            <span className="text-brand-green font-extrabold text-xl leading-none uppercase tracking-tight">{restOfName}</span>
        </div>
        
        <div className="flex-grow flex items-center justify-center w-full mb-1">
          <p className="text-gray-800 text-center text-lg leading-tight px-1 line-clamp-2">
            {data.dishName || "Dish Name"}
          </p>
        </div>
        
        <div className="flex-grow flex flex-col justify-center items-center mb-1">
            <div className="w-8 h-8 rounded-full border-2 border-brand-green flex items-center justify-center bg-brand-green/5">
                <span className="text-brand-green font-bold text-lg leading-none">{dishLetter}</span>
            </div>
            {data.dishType && <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{data.dishType}</span>}
        </div>
        
        {data.allergens && (
             <div className="w-full text-center mb-0.5"><p className="text-brand-pink font-bold uppercase text-[9px] truncate px-2">{data.allergens}</p></div>
        )}

        <div className="w-full text-center border-t border-dashed border-gray-100 pt-1">
          <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wide truncate">{brandText}</p>
        </div>
      </div>
    </div>
  );
};

// -- Main App Component --
const App = () => {
  const [rawData, setRawData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [mapping, setMapping] = useState({ customerName: '', dishLetter: '', dishType: '', dishName: '', allergens: '', brand: '' });
  const [keys, setKeys] = useState([]);
  const [step, setStep] = useState(1); 

  // Helper to flatten the nested specific JSON structure provided by user
  const preprocessNestedData = (data) => {
    let flatList = [];
    let isNested = false;

    data.forEach(item => {
      // Check for specific structure: has boxes array and deliveryName or name
      if (item.boxes && Array.isArray(item.boxes)) {
        isNested = true;
        const footerName = item.deliveryName || item.name || "Unknown";

        item.boxes.forEach((box) => {
          if (box.dishes && Array.isArray(box.dishes)) {
            box.dishes.forEach((dish) => {
              const dishName = dish.name || "";
              const dishLabel = dish.label || "";
              const recipeType = dish.recipeType || "";
              const allergens = dish.allergens ? (Array.isArray(dish.allergens) ? dish.allergens.join(", ") : dish.allergens) : "";
              
              if (dish.users && Array.isArray(dish.users) && dish.users.length > 0) {
                dish.users.forEach((user) => {
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

  const handleDataLoaded = (data) => {
    const processedData = preprocessNestedData(data);
    setRawData(processedData);

    if (processedData.length > 0) {
      const availableKeys = Object.keys(processedData[0]).filter(k => k !== '_initialQty');
      setKeys(availableKeys);
      
      const newMapping = {
        customerName: availableKeys.find(k => /customer|user/.test(k.toLowerCase())) || '',
        dishLetter: availableKeys.find(k => /letter|code|label/.test(k.toLowerCase())) || '',
        dishType: availableKeys.find(k => /type|recipe/.test(k.toLowerCase())) || '',
        dishName: availableKeys.find(k => /dish|name/.test(k.toLowerCase())) || availableKeys[0] || '',
        allergens: availableKeys.find(k => /allergen/.test(k.toLowerCase())) || '',
        brand: availableKeys.find(k => /brand|restaurant/.test(k.toLowerCase())) || ''
      };
      setMapping(newMapping);
      setStep(2);
    }
  };

  useEffect(() => {
    if (rawData.length === 0) return;
    
    const transformed = rawData.map((item, idx) => ({
      id: `label-${idx}`,
      customerName: item[mapping.customerName] ? String(item[mapping.customerName]) : '',
      dishLetter: item[mapping.dishLetter] ? String(item[mapping.dishLetter]) : '',
      dishType: item[mapping.dishType] ? String(item[mapping.dishType]) : '',
      dishName: item[mapping.dishName] ? String(item[mapping.dishName]) : '',
      allergens: item[mapping.allergens] ? String(item[mapping.allergens]) : '',
      brand: item[mapping.brand] ? String(item[mapping.brand]) : 'BELLABONA',
      quantity: item._initialQty || item.quantity || 1
    }));
    setMappedData(transformed);
  }, [rawData, mapping]);

  const handleMappingChange = (key, value) => {
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
             <div className="mt-16 text-xs text-gray-300">
               v1.4 (Direct Print Update)
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900">Map Your Data</h2>
               <p className="text-gray-600">Select which fields from your JSON correspond to the label layout.</p>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
               <div className="p-6 grid gap-6">
                 <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="scale-75 origin-center">
                       <LabelPreview 
                          data={{ 
                            id: 'demo', 
                            customerName: mapping.customerName ? (rawData[0][mapping.customerName] || 'Harsh') : 'Harsh', 
                            dishLetter: mapping.dishLetter ? (rawData[0][mapping.dishLetter] || 'A') : 'A', 
                            dishType: mapping.dishType ? (rawData[0][mapping.dishType] || 'Starter') : 'Starter', 
                            dishName: mapping.dishName ? (rawData[0][mapping.dishName] || 'Tomato Soup') : 'Tomato Soup', 
                            allergens: mapping.allergens ? (rawData[0][mapping.allergens] || 'Gluten') : 'Gluten', 
                            brand: mapping.brand ? (rawData[0][mapping.brand] || 'BELLABONA') : 'BELLABONA',
                            quantity: 1
                          }} 
                        />
                    </div>
                 </div>

                 <div className="space-y-4">
                          {['customerName', 'dishLetter', 'dishType', 'dishName', 'allergens', 'brand'].map(f => (
                             <div key={f}><label className="text-xs uppercase font-bold">{f}</label><select value={mapping[f]} onChange={e => setMapping({...mapping, [f]: e.target.value})} className="w-full text-sm border rounded"><option value="">(None)</option>{keys.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                          ))}
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
             
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Printing Tip:</strong> For perfect alignment, set "Scale" to <strong>100%</strong> (or "Actual Size") in your print dialog and ensure paper size is set to <strong>A4</strong>. 
                  Printing on Letter size or using "Fit to Page" will cause misalignment at the bottom.
                </div>
             </div>

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);