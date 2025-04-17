import { generateSampleSalesData, generateSampleFunnelData } from '../data/sampleData';

interface SampleDataLoaderProps {
  onLoadSampleData: (salesData: any[], funnelData: any[]) => void;
}

export default function SampleDataLoader({ onLoadSampleData }: SampleDataLoaderProps) {
  const handleLoadSampleData = () => {
    const sampleSalesData = generateSampleSalesData(100);
    const sampleFunnelData = generateSampleFunnelData(15);
    onLoadSampleData(sampleSalesData, sampleFunnelData);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Don't have data files?</h3>
        <p className="text-blue-700 mb-3 text-center text-sm">
          Try the dashboard with sample data to explore its features
        </p>
        <button
          onClick={handleLoadSampleData}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Load Sample Data
        </button>
      </div>
    </div>
  );
}
