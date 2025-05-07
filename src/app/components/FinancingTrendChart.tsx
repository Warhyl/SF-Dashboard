import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parse } from 'date-fns';

interface FinancingTrendChartProps {
  salesData: any[];
  dateRangeFilter: { start: string; end: string } | null;
  financerFilter: string | null;
  cityFilter: string | null;
}

export default function FinancingTrendChart({ 
  salesData,
  dateRangeFilter,
  financerFilter,
  cityFilter
}: FinancingTrendChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!salesData.length) return;

    console.log("FinancingTrendChart received sales data:", salesData.length);
    
    // Filter the data
    let filteredData = [...salesData];
    
    if (dateRangeFilter && dateRangeFilter.start && dateRangeFilter.end) {
      console.log("Applying date filter:", dateRangeFilter);
      filteredData = filteredData.filter(item => {
        const itemDate = String(item.Financed_Date);
        const startDate = String(dateRangeFilter.start);
        const endDate = String(dateRangeFilter.end);
        
        return itemDate >= startDate && itemDate <= endDate;
      });
      console.log("After date filtering:", filteredData.length);
    }
    
    if (financerFilter) {
      filteredData = filteredData.filter(item => item.Financer === financerFilter);
      console.log("After financer filtering:", filteredData.length);
    }
    
    if (cityFilter) {
      filteredData = filteredData.filter(item => item.City === cityFilter);
      console.log("After city filtering:", filteredData.length);
    }

    // Group data by date
    const groupedByDate = filteredData.reduce((acc, item) => {
      const date = String(item.Financed_Date);
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count += 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    const sortedData = Object.values(groupedByDate)
      .sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)));

    console.log(`Generated chart data: ${sortedData.length} data points`);
    if (sortedData.length > 0) {
      console.log("First point:", sortedData[0]);
      console.log("Last point:", sortedData[sortedData.length - 1]);
    }
    
    setChartData(sortedData);
  }, [salesData, dateRangeFilter, financerFilter, cityFilter]);

  const formatXAxis = (dateStr: string) => {
    try {
      // Assuming date is in format YYYY-MM-DD
      return format(new Date(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };

  const tooltipFormatter = (value: number) => [`${value} Applications`, 'Applications'];
  const dateFormatter = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (e) {
      return date;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <h3 className="text-lg font-semibold mb-2">Financing Trend Over Time</h3>
      {chartData.length > 0 ? (
        <div className="h-[340px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="95%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                angle={-45}
                textAnchor="end"
                height={50}
                dy={10}
              />
              <YAxis 
                tickFormatter={(value) => value.toLocaleString()}
                dx={-5}
              />
              <Tooltip 
                formatter={tooltipFormatter}
                labelFormatter={dateFormatter}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Loan Applications" 
                stroke="#2563eb" 
                strokeWidth={2} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
