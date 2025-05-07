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
      
      // Detect line ending (handle both Windows and Unix line endings)
      const lineEnding = csvData.includes('\r\n') ? '\r\n' : '\n';
      const lines = csvData.split(lineEnding);
      
      console.log(`Processing file: ${file.name} with ${lines.length} lines`);
      
      // Detect the delimiter (comma or semicolon are common in CSVs)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(',') ? ',' : firstLine.includes(';') ? ';' : ',';
      
      // Parse headers
      const headers = firstLine.split(delimiter);
      // Trim header names to avoid whitespace issues
      const cleanHeaders = headers.map(h => h.trim());
      
      // Check if Financed_Date field exists
      const financedDateIndex = cleanHeaders.findIndex(h => 
        h === 'Financed_Date' || h === 'financed_date' || h === 'FinancedDate' || h === 'Date'
      );
      
      if (financedDateIndex === -1) {
        console.warn("Warning: No Financed_Date field found in CSV. Headers:", cleanHeaders);
      } else {
        console.log(`Found Financed_Date at index ${financedDateIndex}`);
      }
      
      const results: any[] = [];
      let dateFormatIssues = 0;
      let rowsSkipped = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          continue; // Skip empty lines
        }
        
        // Handle quoted values in CSV (e.g., "value with, comma")
        let values: string[] = [];
        let currentValue = "";
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            values.push(currentValue);
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        
        // Don't forget the last value
        values.push(currentValue);
        
        // Skip rows with incorrect number of columns
        if (values.length !== cleanHeaders.length) {
          console.warn(`Row ${i} has ${values.length} columns but headers have ${cleanHeaders.length}. Skipping.`);
          rowsSkipped++;
          continue;
        }
        
        const obj: any = {};
        
        for (let j = 0; j < cleanHeaders.length; j++) {
          let header = cleanHeaders[j];
          let value = values[j]?.trim() || '';
          
          // Remove quotes if the value is wrapped in them
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          
          // Special handling for date fields
          if ((header === 'Financed_Date' || j === financedDateIndex) && value) {
            try {
              // Detect date format - could be YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, etc.
              let dateObj: Date | null = null;
              
              // Check for ISO format YYYY-MM-DD
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                dateObj = new Date(value);
              }
              // Check for MM/DD/YYYY or DD/MM/YYYY
              else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
                const parts = value.split('/');
                // Assume MM/DD/YYYY for now
                dateObj = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
              }
              // Try general date parsing
              else {
                dateObj = new Date(value);
              }
              
              if (dateObj && !isNaN(dateObj.getTime())) {
                // Format to ensure consistent YYYY-MM-DD format
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                obj[header] = `${year}-${month}-${day}`;
              } else {
                // Invalid date, keep as original string but log the issue
                obj[header] = value;
                dateFormatIssues++;
              }
            } catch (e) {
              // If date parsing fails, keep as original string
              obj[header] = value;
              dateFormatIssues++;
            }
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
      
      if (dateFormatIssues > 0) {
        console.warn(`Found ${dateFormatIssues} date format issues in ${file.name}`);
      }
      
      if (rowsSkipped > 0) {
        console.warn(`Skipped ${rowsSkipped} rows due to format issues`);
      }
      
      console.log(`Processed ${results.length} rows successfully from ${file.name}`);
      
      // Display the first and last few records to check for data consistency
      if (results.length > 0) {
        console.log("First record:", results[0]);
        console.log("Last record:", results[results.length - 1]);
        
        // Check date ranges in the data
        const dates = results
          .filter(item => item.Financed_Date)
          .map(item => String(item.Financed_Date));
        
        if (dates.length > 0) {
          const sortedDates = [...dates].sort();
          console.log("Date range in data:", {
            first: sortedDates[0],
            last: sortedDates[sortedDates.length - 1],
            total: sortedDates.length,
            uniqueDates: [...new Set(sortedDates)].length
          });
        }
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
