import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopFinancedModelsChartProps {
  salesData: any[];
  dateRangeFilter: { start: string; end: string } | null;
  cityFilter: string | null;
}

export default function TopFinancedModelsChart({ 
  salesData,
  dateRangeFilter,
  cityFilter
}: TopFinancedModelsChartProps) {
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
    
    if (cityFilter) {
      filteredData = filteredData.filter(item => item.City === cityFilter);
    }

    // Group data by model
    const groupedByModel = filteredData.reduce((acc, item) => {
      const model = item.Purchased_Model_Name || 'Unknown';
      if (!acc[model]) {
        acc[model] = {
          model,
          count: 0
        };
      }
      acc[model].count += 1;
      return acc;
    }, {});

    // Convert to array, sort by count, and limit to top 10
    const sortedData = Object.values(groupedByModel)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    setChartData(sortedData);
  }, [salesData, dateRangeFilter, cityFilter]);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold mb-4">Top Financed Models</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="model" 
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={60} 
              tick={{ fontSize: 10 }}
            />
            <YAxis tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip formatter={(value) => [`${value} Applications`, 'Applications']} />
            <Bar 
              dataKey="count" 
              name="Loan Applications" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
            />
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
