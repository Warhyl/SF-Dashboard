import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesByCityChartProps {
  salesData: any[];
  dateRangeFilter: { start: string; end: string } | null;
  financerFilter: string | null;
  modelFilter: string | null;
}

export default function SalesByCityChart({ 
  salesData,
  dateRangeFilter,
  financerFilter,
  modelFilter
}: SalesByCityChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!salesData.length) return;

    // Filter the data
    let filteredData = [...salesData];
    
    if (dateRangeFilter) {
      filteredData = filteredData.filter(item => {
        const itemDate = item.Financed_Date;
        return itemDate >= dateRangeFilter.start && itemDate <= dateRangeFilter.end;
      });
    }
    
    if (financerFilter) {
      filteredData = filteredData.filter(item => item.Financer === financerFilter);
    }
    
    if (modelFilter) {
      filteredData = filteredData.filter(item => item.Purchased_Model_Name === modelFilter);
    }

    // Group data by city
    const groupedByCity = filteredData.reduce((acc, item) => {
      const city = item.City || 'Unknown';
      if (!acc[city]) {
        acc[city] = {
          city,
          totalAmount: 0
        };
      }
      acc[city].totalAmount += Number(item.Principal_Amount) || 0;
      return acc;
    }, {});

    // Convert to array, sort by amount, and limit to top 10 cities for clarity
    const sortedData = Object.values(groupedByCity)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    setChartData(sortedData);
  }, [salesData, dateRangeFilter, financerFilter, modelFilter]);

  const tooltipFormatter = (value: number) => [
    `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`,
    'Amount Financed'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold mb-1">Sales by City</h3>
      <div className="text-xs text-gray-500 mb-3">Showing Top 10 Cities by Amount Financed</div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
            <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000).toLocaleString('en-PH')}K`} />
            <YAxis 
              dataKey="city" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={50}
            />
            <Tooltip formatter={tooltipFormatter} />
            <Bar 
              dataKey="totalAmount" 
              name="Amount Financed" 
              fill="url(#cityBarGradient)" 
              radius={[0, 4, 4, 0]}
              label={{ 
                position: 'right', 
                formatter: (v: number) => `₱${(v/1000).toLocaleString('en-PH')}K`, 
                fontSize: 11, 
                fill: '#2563eb', 
                fontWeight: 500,
                offset: 5
              }}
              maxBarSize={24}
            />
            <defs>
              <linearGradient id="cityBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
