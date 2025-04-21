"use client";

import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Logo from './components/Logo';
import Filters, { FilterState } from './components/Filters';
import KpiCards from './components/KpiCards';
import FinancingTrendChart from './components/FinancingTrendChart';
import SalesByCityChart from './components/SalesByCityChart';
import TopFinancedModelsChart from './components/TopFinancedModelsChart';
import SalesFunnelChart from './components/SalesFunnelChart';
import SampleDataLoader from './components/SampleDataLoader';

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    city: null,
    financer: null,
    store: null,
    storeCode: null,
    model: null,
  });
  const [dataLoaded, setDataLoaded] = useState<{
    sales: boolean;
    funnel: boolean;
  }>({ sales: false, funnel: false });
  

  // Handle file upload
  const handleDataLoaded = (data: any[], fileName: string) => {
    if (fileName.includes('Daily_Sales_Dump')) {
      setSalesData(data);
      setDataLoaded(prev => ({ ...prev, sales: true }));
    } else if (fileName.includes('Daily_Sales_Funnel')) {
      setFunnelData(data);
      setDataLoaded(prev => ({ ...prev, funnel: true }));
    }
  };

  // Handle loading sample data
  const handleLoadSampleData = (sampleSalesData: any[], sampleFunnelData: any[]) => {
    setSalesData(sampleSalesData);
    setFunnelData(sampleFunnelData);
    setDataLoaded({ sales: true, funnel: true });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Apply filters to data
  const getFilteredSalesData = () => {
    let filtered = [...salesData];
    
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(item => {
        return item.Financed_Date >= filters.dateRange!.start && 
               item.Financed_Date <= filters.dateRange!.end;
      });
    }
    
    if (filters.city) {
      filtered = filtered.filter(item => item.City === filters.city);
    }
    
    if (filters.financer) {
      filtered = filtered.filter(item => item.Financer === filters.financer);
    }
    
    if (filters.store) {
      const storeField = filtered[0]?.Channel_Name ? 'Channel_Name' : 'Store_Name';
      filtered = filtered.filter(item => item[storeField] === filters.store);
    }
    
    if (filters.storeCode) {
      filtered = filtered.filter(item => item.Channel_Code === filters.storeCode);
    }
    
    if (filters.model) {
      filtered = filtered.filter(item => item.Purchased_Model_Name === filters.model);
    }
    
    return filtered;
  };

  const getFilteredFunnelData = () => {
    let filtered = [...funnelData];
    
    if (filters.store) {
      const storeField = filtered[0]?.Channel_Name ? 'Channel_Name' : 'Store_Name';
      filtered = filtered.filter(item => item[storeField] === filters.store);
    }
    
    if (filters.storeCode) {
      filtered = filtered.filter(item => item.Channel_Code === filters.storeCode);
    }
    
    return filtered;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center gap-4">
  <Logo size={56} />
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Samsung Finance+ Dashboard</h1>
    <p className="text-gray-600 text-sm">
      Real-time overview of financing sales performance with visualizations
    </p>
  </div>
</header>
        
        {/* File Upload Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-sm font-medium">Data Files</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <FileUpload 
                onDataLoaded={handleDataLoaded} 
                label="Daily_Sales_Dump.csv"
              />
            </div>
            <div className="flex-1 min-w-[250px]">
              <FileUpload 
                onDataLoaded={handleDataLoaded} 
                label="Daily_SalesFunnel.csv"
              />
            </div>
          </div>
        </div>
        
        {/* Show dashboard only when data is loaded */}
        {(dataLoaded.sales || dataLoaded.funnel) ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-3">Overview KPIs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Filters - Simplified version */}
                <div className="md:col-span-3 lg:col-span-4">
                  <div className="filter-section">
                    {/* Restore the actual Filters component but styled to match Samsung Finance+ */}
                    <Filters 
                      salesData={salesData} 
                      funnelData={funnelData}
                      onFilterChange={handleFilterChange} 
                    />
                  </div>
                </div>
              </div>
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dataLoaded.sales && (
                  <KpiCards 
                    salesData={getFilteredSalesData()} 
                    funnelData={getFilteredFunnelData()} 
                  />
                )}
              </div>
            </div>
            
            {/* Sales Trends Section */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-3">Sales Trends</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financing Trend Over Time first */}
                {dataLoaded.sales && (
                  <div className="chart-container h-auto">
                    <h3 className="chart-title">Financing Trend Over Time</h3>
                    <FinancingTrendChart 
                      salesData={salesData}
                      dateRangeFilter={filters.dateRange}
                      financerFilter={filters.financer}
                      cityFilter={filters.city}
                    />
                  </div>
                )}
                
                {/* Sales by City second */}
                {dataLoaded.sales && (
                  <div className="chart-container h-auto">
                    <h3 className="chart-title">Sales by City</h3>
                    <SalesByCityChart 
                      salesData={salesData}
                      dateRangeFilter={filters.dateRange}
                      financerFilter={filters.financer}
                      modelFilter={filters.model}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Product & Location Insights Section */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-3">Product & Location Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Financed Models */}
                {dataLoaded.sales && (
                  <div className="chart-container">
                    <h3 className="chart-title">Top Financed Models</h3>
                    <TopFinancedModelsChart 
                      salesData={salesData}
                      dateRangeFilter={filters.dateRange}
                      cityFilter={filters.city}
                    />
                  </div>
                )}
                
                {/* Sales Funnel by Store */}
                {dataLoaded.funnel && (
                  <div className="chart-container">
                    <SalesFunnelChart 
                      funnelData={funnelData}
                      storeFilter={filters.store}
                      latestDate={(() => {
                        if (!salesData.length) return undefined;
                        const dates = salesData
                          .filter(item => item.Financed_Date)
                          .map(item => new Date(item.Financed_Date));
                        if (!dates.length) return undefined;
                        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
                        // Format as '15 April 2025'
                        return latest.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        });
                      })()}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Sales Financing Dashboard</h2>
            <p className="mb-6">Please upload the required CSV files to view the dashboard</p>
            <ul className="text-left max-w-md mx-auto mb-4">
              <li className="flex items-center gap-2 mb-2">
                <span className="text-blue-500">•</span>
                <span><strong>Daily_Sales_Dump.csv</strong>: Contains information about financed applications</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Daily_SalesFunnel.csv</strong>: Contains information about the sales funnel</span>
              </li>
            </ul>
            
            {/* Sample Data Loader */}
            <div className="mt-8">
              <SampleDataLoader onLoadSampleData={handleLoadSampleData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
