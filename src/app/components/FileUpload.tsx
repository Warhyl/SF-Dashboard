import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onDataLoaded: (data: any[], fileName: string) => void;
  accept?: string;
  label: string;
}

export default function FileUpload({ onDataLoaded, accept = '.csv', label }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result as string;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      const results: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const obj: any = {};
        
        for (let j = 0; j < headers.length; j++) {
          let header = headers[j].trim();
          let value = values[j]?.trim() || '';
          
          // Special handling for date fields
          if (header === 'Financed_Date' && value) {
            // Store date as string in YYYY-MM-DD format for consistent comparison
            obj[header] = value;
          }
          // Try to convert numeric values
          else if (!isNaN(Number(value)) && value !== '') {
            obj[header] = Number(value);
          } else {
            obj[header] = value;
          }
        }
        
        results.push(obj);
      }
      
      onDataLoaded(results, file.name);
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  });

  return (
    <div>
      <div className="flex items-center mb-2">
        <div className="flex-1 font-medium text-sm">{label}</div>
        <div className="flex-0">
          {fileName && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Loaded</span>}
        </div>
      </div>
      <div 
        {...getRootProps()} 
        className={`border border-solid p-3 rounded-md text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : fileName ? (
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
        ) : (
          <div className="py-1">
            <p className="text-sm text-blue-600">Browse files</p>
          </div>
        )}
      </div>
    </div>
  );
}
