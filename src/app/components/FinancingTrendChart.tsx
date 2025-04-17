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
    
    if (cityFilter) {
      filteredData = filteredData.filter(item => item.City === cityFilter);
    }

    // Group data by date
    const groupedByDate = filteredData.reduce((acc, item) => {
      const date = item.Financed_Date;
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count += 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    const sortedData = Object.values(groupedByDate)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

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
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold mb-4">Financing Trend Over Time</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={(value) => value.toLocaleString()}
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
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
