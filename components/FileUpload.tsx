import React, { useState } from 'react';
import { ClipboardPaste, AlertCircle, ArrowRight, FileJson } from 'lucide-react';
import JSON5 from 'json5';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    setError(null);
    if (!jsonText.trim()) {
      setError("Please paste some JSON data.");
      return;
    }

    try {
      // JSON5 handles most trailing commas and unquoted keys.
      // We removed the aggressive smart-quote replacement because it would accidentally replace
      // smart quotes inside valid string values (e.g., "Mushroom Sauce “Hunter-Style”") 
      // with unescaped straight double-quotes, breaking the JSON structure.
      const json = JSON5.parse(jsonText);
      
      if (Array.isArray(json)) {
        onDataLoaded(json);
      } else if (typeof json === 'object' && json !== null) {
        // If single object, wrap in array
        onDataLoaded([json]);
      } else {
        setError("JSON must be an array of objects or a single object.");
      }
    } catch (err: any) {
      setError(`Invalid JSON format: ${err.message || "Please check for missing commas, quotes, or brackets."}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
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

        {/* Editor Area */}
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

        {/* Footer / Actions */}
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
