import { useState, useEffect } from 'react';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SalesFunnelChartProps {
  funnelData: any[];
  storeFilter: string | null;
  latestDate?: string;
}

export default function SalesFunnelChart({ funnelData, storeFilter, latestDate }: SalesFunnelChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  // Define the funnel step type with conversion rate
  interface FunnelStep {
    name: string;
    value: number;
    fill: string;
    conversionRate?: string;
  }

  useEffect(() => {
    if (!funnelData.length) return;

    // Filter by store if specified
    let filteredData = [...funnelData];
    
    if (storeFilter) {
      filteredData = filteredData.filter(item => {
        const storeName = item.Store_Name || item.Channel_Name;
        return storeName === storeFilter;
      });
    }

    // Sum up the values for each funnel step
    const funnelSteps: FunnelStep[] = [
      { name: 'Purchases Started', value: 0, fill: '#60a5fa' },
      { name: 'Info Submitted', value: 0, fill: '#4f46e5' },
      { name: 'Offer Seen', value: 0, fill: '#818cf8' },
      { name: 'Offer Selected', value: 0, fill: '#6366f1' },
      { name: 'KYC Completed', value: 0, fill: '#3b82f6' },
      { name: 'Agreement Signed', value: 0, fill: '#2563eb' },
      { name: 'Completed Purchases', value: 0, fill: '#1d4ed8' },
    ];

    // Aggregate data for all funnel steps
    filteredData.forEach(item => {
      funnelSteps[0].value += Number(item.Purchases_Started) || 0;
      funnelSteps[1].value += Number(item.Info_Submitted) || 0;
      funnelSteps[2].value += Number(item.Offer_Seen) || 0;
      funnelSteps[3].value += Number(item.Offer_Selected) || 0;
      funnelSteps[4].value += Number(item.KYC_Completed) || 0;
      funnelSteps[5].value += Number(item.Agreement_Signed) || 0;
      funnelSteps[6].value += Number(item.Completed_Purchases) || 0;
    });

    // Calculate conversion rates
    funnelSteps.forEach((step, index) => {
      if (index > 0 && funnelSteps[index - 1].value > 0) {
        const conversionRate = ((step.value / funnelSteps[index - 1].value) * 100).toFixed(1);
        step.conversionRate = `${conversionRate}%`;
      }
    });

    setChartData(funnelSteps);
  }, [funnelData, storeFilter]);

  const tooltipFormatter = (value: number, name: string, props: any) => {
    const { payload } = props;
    return [
      `${value.toLocaleString()} ${name}`,
      payload.conversionRate ? `Conversion: ${payload.conversionRate}` : ''
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-96">
      <h3 className="text-lg font-semibold mb-4">
        Total Sales Funnel{latestDate ? ` of ${latestDate}` : ''}
      </h3>
      {chartData.length > 0 && chartData[0].value > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <FunnelChart>
            <Tooltip formatter={tooltipFormatter} />
            <Funnel
              dataKey="value"
              data={chartData}
              isAnimationActive
              labelLine={false}
            >
              <LabelList
                dataKey={step => `${step.name}: ${step.value.toLocaleString()}`}
                position="right"
                fill="#1e293b" // slate-800, Samsung dark
                fontSize={14}
                stroke="none"
                style={{ fontWeight: 600 }}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
