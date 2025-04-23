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
      
      // Approach: Make a temporary clone and adjust it for export
      const originalElement = dashboardRef.current;
      
      // Create a temporary clone of the dashboard for export outside the DOM
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      
      // Copy the dashboard content
      tempContainer.innerHTML = originalElement.innerHTML;
      document.body.appendChild(tempContainer);
      
      // Apply styling fixes to the temporary container
      // Fix chart heights
      const chartContainers = tempContainer.querySelectorAll('.chart-container');
      chartContainers.forEach((container: Element) => {
        const containerElement = container as HTMLElement;
        containerElement.style.height = 'auto';
        containerElement.style.minHeight = '400px';
        containerElement.style.maxHeight = '450px';
        containerElement.style.overflow = 'hidden';
        containerElement.style.marginBottom = '16px';
        
        // Remove extra padding
        const paddingElements = containerElement.querySelectorAll('.p-4, .p-6, .p-10');
        paddingElements.forEach((element: Element) => {
          const paddingElement = element as HTMLElement;
          paddingElement.style.padding = '8px';
        });
      });
      
      // Decrease margin-bottom on section divs
      const sections = tempContainer.querySelectorAll('.mb-6');
      sections.forEach((section: Element) => {
        const sectionElement = section as HTMLElement;
        sectionElement.style.marginBottom = '16px';
      });
      
      // Adjust grid gaps
      const grids = tempContainer.querySelectorAll('.grid');
      grids.forEach((grid: Element) => {
        const gridElement = grid as HTMLElement;
        gridElement.style.gap = '8px';
      });
      
      // Fix truncated text in filter/select elements
      const truncateElements = tempContainer.querySelectorAll('.truncate');
      truncateElements.forEach((element: Element) => {
        const truncateElement = element as HTMLElement;
        truncateElement.classList.remove('truncate');
        truncateElement.style.whiteSpace = 'normal';
        truncateElement.style.overflow = 'visible';
      });
      
      // Fix dropdown buttons for export
      const dropdownButtons = tempContainer.querySelectorAll('button');
      dropdownButtons.forEach((button: Element) => {
        const buttonElement = button as HTMLElement;
        
        // For dropdown buttons that contain an SVG (caret icon)
        const svgElement = buttonElement.querySelector('svg');
        if (svgElement) {
          // Remove the SVG/caret icon completely
          svgElement.remove();
          
          // Ensure the text is displayed correctly
          const textSpan = buttonElement.querySelector('span');
          if (textSpan) {
            textSpan.style.width = '100%';
            textSpan.style.textAlign = 'left';
            textSpan.style.display = 'block';
            textSpan.style.whiteSpace = 'normal';
            textSpan.style.overflow = 'visible';
            textSpan.style.wordBreak = 'break-word';
          }
          
          // Style the button itself
          buttonElement.style.height = 'auto';
          buttonElement.style.minHeight = '38px';
          buttonElement.style.padding = '8px 12px';
          buttonElement.style.display = 'block';
          buttonElement.style.textAlign = 'left';
        }
      });
      
      // Also fix select elements
      const selectElements = tempContainer.querySelectorAll('select');
      selectElements.forEach((select: Element) => {
        // Create a div to replace the select
        const selectValue = (select as HTMLSelectElement).options[(select as HTMLSelectElement).selectedIndex]?.text || "";
        const div = document.createElement('div');
        div.textContent = selectValue;
        div.style.border = '1px solid #e5e7eb';
        div.style.borderRadius = '6px';
        div.style.padding = '8px 12px';
        div.style.fontSize = '14px';
        div.style.width = '100%';
        div.style.minHeight = '38px';
        div.style.backgroundColor = 'white';
        
        // Replace the select with the div
        select.parentNode?.replaceChild(div, select);
      });
      
      // Add fixed tooltips for charts
      const addTooltipsToCharts = () => {
        // We'll replace this with axis fixes without adding tooltips
        
        // Fix chart axis and labels
        const chartWrappers = tempContainer.querySelectorAll('.recharts-wrapper');
        chartWrappers.forEach((wrapper: Element) => {
          // Fix y-axis
          const yAxisLabels = wrapper.querySelectorAll('.recharts-cartesian-axis-tick-value');
          yAxisLabels.forEach((label: Element) => {
            const labelElement = label as HTMLElement;
            // Ensure Y-axis labels are properly sized and positioned
            labelElement.style.fontSize = '10px';
            labelElement.style.fontWeight = 'normal';
          });
          
          // Fix chart background for better visibility
          const cartesianGrid = wrapper.querySelector('.recharts-cartesian-grid');
          if (cartesianGrid) {
            (cartesianGrid as HTMLElement).style.opacity = '0.3';
          }
          
          // Fix legend if present
          const legend = wrapper.querySelector('.recharts-legend-wrapper');
          if (legend) {
            (legend as HTMLElement).style.fontSize = '12px';
            (legend as HTMLElement).style.padding = '8px 0';
          }
        });
        
        // Hide any existing tooltips
        const tooltips = tempContainer.querySelectorAll('.recharts-tooltip-wrapper');
        tooltips.forEach((tooltip: Element) => {
          (tooltip as HTMLElement).style.display = 'none';
        });
      };
      
      // Wait for charts to render before adding tooltips
      setTimeout(() => {
        addTooltipsToCharts();
        
        // Capture the temporary container as canvas
        html2canvas(tempContainer, {
          allowTaint: true,
          useCORS: true,
          scale: 2,
          backgroundColor: '#f9fafb',
          height: tempContainer.scrollHeight,
          windowHeight: tempContainer.scrollHeight,
          onclone: (clonedDoc) => {
            // Additional last-minute fixes for the cloned document
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              .recharts-wrapper { margin: 0 auto !important; }
              .recharts-surface { overflow: visible !important; }
              .recharts-tooltip-wrapper { 
                display: none !important;
                opacity: 0 !important; 
                visibility: hidden !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        }).then(canvas => {
          // Remove the temporary container
          document.body.removeChild(tempContainer);
          
          // Create file name with date
          const date = new Date();
          const fileName = `samsung-finance-dashboard-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          
          if (exportFormat === 'pdf') {
            // Create PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: 'a3', // Use larger A3 format for more content
            });
            
            // Calculate aspect ratio to fit PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate the scaling factor to fit the entire dashboard
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let imgWidth, imgHeight;
            
            if (canvasAspectRatio > pdfAspectRatio) {
              // If canvas is wider than PDF page
              imgWidth = pdfWidth - 20; // 10mm margins on each side
              imgHeight = imgWidth / canvasAspectRatio;
            } else {
              // If canvas is taller than PDF page
              imgHeight = pdfHeight - 20; // 10mm margins on top and bottom
              imgWidth = imgHeight * canvasAspectRatio;
            }
            
            // Center the image on the page
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            
            // Add the image to the PDF
            pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
            
            // If the dashboard is too big to fit on one page, we can split it across multiple pages
            if (canvas.height > 2000) {
              // Create a multi-page PDF for very large dashboards
              const totalPages = Math.ceil(canvas.height / 1000);
              const pageHeight = canvas.height / totalPages;
              
              pdf.deletePage(1); // Remove the first attempt
              
              for (let i = 0; i < totalPages; i++) {
                pdf.addPage('a3', 'landscape');
                pdf.addImage(
                  imgData, 
                  'JPEG', 
                  10, // X position (10mm margin)
                  10 - (i * pageHeight * pdfWidth / canvas.width), // Y position adjusted for each page
                  pdfWidth - 20, // Width (minus 20mm total margin)
                  canvas.height * (pdfWidth - 20) / canvas.width // Height proportional to width
                );
              }
            }
            
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
          
          setExporting(false);
        }).catch(error => {
          console.error('Error capturing canvas:', error);
          document.body.removeChild(tempContainer);
          setExporting(false);
          alert('Failed to export dashboard. Please try again.');
        });
      }, 100); // Short delay to ensure DOM is updated
      
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      setExporting(false);
      alert('Failed to export dashboard. Please try again.');
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