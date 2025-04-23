"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportDashboardProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
}

const ExportDashboard: React.FC<ExportDashboardProps> = ({ dashboardRef }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');

  const handleExport = async () => {
    if (!dashboardRef.current || exporting) return;
    
    try {
      setExporting(true);
      
      // Configure html2canvas options
      const options = {
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        scale: 2, // Higher scale for better quality
        backgroundColor: '#f9fafb', // Match the dashboard background
        onclone: (clonedDoc: Document) => {
          // Add custom styles to the cloned document to ensure tooltips are visible
          // and filter text shows correctly
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            .recharts-tooltip-wrapper {
              opacity: 1 !important;
              visibility: visible !important;
              transform: translate(0, 0) !important;
            }
            .recharts-active-dot {
              r: 6 !important;
            }
            .recharts-dot {
              fill: #3b82f6 !important;
            }
            /* Fix text truncation in dropdown and select elements */
            button span.truncate, 
            select option, 
            select {
              text-overflow: clip !important;
              overflow: visible !important;
              white-space: normal !important;
              word-wrap: break-word !important;
            }
            /* Ensure filter buttons display their full content */
            .filter-section button,
            .filter-section select {
              text-overflow: unset !important;
              overflow: visible !important;
              white-space: normal !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Fix select elements to show their selected value fully
          const selectElements = clonedDoc.querySelectorAll('select');
          selectElements.forEach(select => {
            // Get the selected option text
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption) {
              // Create a visible display of the selected value
              const displayValue = clonedDoc.createElement('div');
              displayValue.textContent = selectedOption.textContent || '';
              displayValue.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 8px; box-sizing: border-box; background: white; z-index: 1;';
              select.parentNode?.appendChild(displayValue);
            }
          });
          
          // Fix the dropdown buttons to show their full text
          const dropdownButtons = clonedDoc.querySelectorAll('.filter-section button');
          dropdownButtons.forEach(button => {
            const span = button.querySelector('span');
            if (span) {
              span.classList.remove('truncate');
              span.style.whiteSpace = 'normal';
            }
          });
          
          // Find and trigger hover states on certain chart elements
          const chartPoints = clonedDoc.querySelectorAll('.recharts-dot, .recharts-bar-rectangle');
          if (chartPoints.length > 0) {
            // Simulate hover on the middle chart point for each chart
            const chartGroups = new Set<Element>();
            chartPoints.forEach(point => {
              const parent = point.closest('.recharts-wrapper');
              if (parent) chartGroups.add(parent);
            });
            
            // For each chart, find a representative point to show tooltip
            chartGroups.forEach(chartGroup => {
              const points = Array.from(chartGroup.querySelectorAll('.recharts-dot, .recharts-bar-rectangle'));
              if (points.length > 0) {
                const middlePoint = points[Math.floor(points.length / 2)];
                // Add a visible tooltip
                const tooltip = clonedDoc.createElement('div');
                tooltip.className = 'recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom';
                tooltip.style.cssText = 'position: absolute; top: 0; left: 0; transform: translate(50%, 50%); pointer-events: none; z-index: 1000;';
                tooltip.innerHTML = '<div class="recharts-tooltip-content" style="background: white; padding: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">Sample Data<br/>Value: 123</div>';
                chartGroup.appendChild(tooltip);
              }
            });
          }
        }
      };

      // Capture the dashboard as canvas
      const canvas = await html2canvas(dashboardRef.current, options);
      
      // Create file name with date
      const date = new Date();
      const fileName = `samsung-finance-dashboard-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      
      if (exportFormat === 'pdf') {
        // Create PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
        });
        
        // Calculate aspect ratio to fit PDF
        const imgWidth = 280; // mm (A4 landscape width with margins)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      } else {
        // Export as PNG or JPEG
        const link = document.createElement('a');
        link.download = `${fileName}.${exportFormat}`;
        link.href = canvas.toDataURL(`image/${exportFormat}`, exportFormat === 'jpeg' ? 0.85 : 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      alert('Failed to export dashboard. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">Export as:</label>
      <select 
        className="rounded-md border-gray-300 shadow-sm text-sm p-1"
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'pdf')}
        disabled={exporting}
      >
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="pdf">PDF</option>
      </select>
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`${
          exporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        } text-white text-sm font-medium py-1 px-3 rounded-md transition-colors flex items-center`}
      >
        {exporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
            Export Dashboard
          </>
        )}
      </button>
    </div>
  );
};

export default ExportDashboard; 